import {
  WebMcpConfirmationRequiredError,
  WebMcpExecutionValidationError,
  WebMcpNameCollisionError,
  WebMcpRegistrationError,
  WebMcpSecurityPolicyError,
  WebMcpUnsupportedError,
} from './errors';
import { getModelContext } from './model-context';
import {
  toBrowserToolName,
  validateToolDescription,
  validateToolName,
} from './name-validation';
import {
  permissivePolicySet,
  type PolicyDecision,
  type WebMcpPolicySet,
} from './policy-types';
import { applyOutputBudget, normalizeWebMcpResult } from './result';
import { createSecurityWarning, validateExposedOrigins } from './security';
import { anySignal } from './signals';
import type {
  BrowserModelContext,
  BrowserWebMcpToolDescriptor,
  RegisteredWebMcpTool,
  RegisterToolOptions,
  VisibleToolSummary,
  WebMcpExecutionContext,
  WebMcpRegistryLike,
  WebMcpRegistryOptions,
  WebMcpToolDescriptor,
} from './types';

export class WebMcpRegistry implements WebMcpRegistryLike {
  private readonly registrations = new Map<string, RegisteredWebMcpTool>();
  private readonly browserNames = new Set<string>();
  private readonly modelContext: BrowserModelContext | undefined;
  private readonly enabled: boolean;
  private readonly policies: WebMcpPolicySet;

  constructor(private readonly options: WebMcpRegistryOptions = {}) {
    this.enabled = options.enabled ?? false;
    this.policies = options.policies ?? permissivePolicySet;
    this.modelContext =
      options.modelContext ??
      getModelContext(
        options.allowNavigatorFallback === undefined
          ? {}
          : { allowNavigatorFallback: options.allowNavigatorFallback },
      );
  }

  registerTool<TArgs, TResult>(
    tool: WebMcpToolDescriptor<TArgs, TResult>,
    options: RegisterToolOptions = {},
  ): RegisteredWebMcpTool {
    validateToolName(tool.name);
    const descriptionWarning = validateToolDescription(
      tool.description,
      this.options.maxDescriptionChars,
    );
    if (descriptionWarning) {
      this.warn(descriptionWarning, tool.name);
    }

    if (this.registrations.has(tool.name)) {
      throw new WebMcpNameCollisionError(tool.name);
    }

    if (this.options.validateExposedTo !== false) {
      validateExposedOrigins(options.exposedTo);
    }

    const browserName = toBrowserToolName(this.options.namespace, tool.name);
    validateToolName(browserName);

    if (!this.evaluateRegistrationPolicies(tool as WebMcpToolDescriptor, options)) {
      const controller = new AbortController();
      return {
        name: tool.name,
        browserName,
        source: options.source ?? 'manual',
        signal: controller.signal,
        abort: () => controller.abort(),
        title: tool.title,
        description: tool.description,
        annotations: tool.annotations,
      };
    }

    if (this.browserNames.has(browserName)) {
      throw new WebMcpNameCollisionError(browserName);
    }

    const controller = new AbortController();
    const signal = anySignal(
      [controller.signal, options.signal].filter(Boolean) as AbortSignal[],
    );
    const source = options.source ?? 'manual';
    const registration: RegisteredWebMcpTool = {
      name: tool.name,
      browserName,
      source,
      signal,
      abort: () => controller.abort(),
      title: tool.title,
      description: tool.description,
      annotations: tool.annotations,
    };

    if (signal.aborted) {
      return registration;
    }

    this.registrations.set(tool.name, registration);
    this.browserNames.add(browserName);

    signal.addEventListener(
      'abort',
      () => {
        this.registrations.delete(tool.name);
        this.browserNames.delete(browserName);
        this.logEvent('unregister', { toolName: tool.name });
        this.options.onUnregister?.(tool.name);
      },
      { once: true },
    );

    const warning = createSecurityWarning(
      tool as WebMcpToolDescriptor<unknown, unknown>,
    );
    if (warning) {
      this.warn(warning, tool.name);
    }

    if (!this.enabled) {
      return registration;
    }

    if (!this.modelContext) {
      this.cleanupRegistration(tool.name, browserName);
      if (this.options.strict) {
        throw new WebMcpUnsupportedError();
      }
      return registration;
    }

    const browserTool = this.toBrowserTool(tool, browserName, signal, source);
    const registerOptions =
      options.exposedTo === undefined
        ? { signal }
        : { signal, exposedTo: options.exposedTo };

    try {
      const result = this.modelContext.registerTool(browserTool, registerOptions);
      if (result instanceof Promise) {
        void result.catch((error) => {
          this.cleanupRegistration(tool.name, browserName);
          this.options.onError?.(error, {
            operation: 'registerTool',
            toolName: tool.name,
          });
          if (this.options.strict) {
            throw new WebMcpRegistrationError(tool.name, error);
          }
        });
      }
      this.logEvent('register', { toolName: tool.name });
      this.options.onRegister?.(tool as WebMcpToolDescriptor);
    } catch (error) {
      this.cleanupRegistration(tool.name, browserName);
      this.options.onError?.(error, {
        operation: 'registerTool',
        toolName: tool.name,
      });
      if (this.options.strict) {
        throw new WebMcpRegistrationError(tool.name, error);
      }
    }

    return registration;
  }

  unregisterTool(name: string): void {
    this.registrations.get(name)?.abort();
  }

  unregisterAll(): void {
    for (const registration of [...this.registrations.values()]) {
      registration.abort();
    }
  }

  getRegisteredToolNames(): string[] {
    return [...this.registrations.keys()];
  }

  getRegisteredToolsForDebug(): RegisteredWebMcpTool[] {
    return [...this.registrations.values()];
  }

  getVisibleToolSummaries(): VisibleToolSummary[] {
    return this.getRegisteredToolsForDebug().map(
      ({ name, browserName, source, title, description, annotations }) => ({
        name,
        browserName,
        source,
        title,
        description,
        annotations,
      }),
    );
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  private evaluateRegistrationPolicies(
    tool: WebMcpToolDescriptor,
    options: RegisterToolOptions,
  ): boolean {
    const context = this.options.policyContext ?? {};
    const production = this.policies.production.canRegister(tool, context);
    if (!this.consumePolicyDecision(production, tool.name)) {
      return false;
    }

    const security = this.policies.security.evaluateTool(
      tool,
      options,
      context,
    );
    return this.consumePolicyDecision(security, tool.name);
  }

  private consumePolicyDecision(
    decision: PolicyDecision,
    toolName: string,
  ): boolean {
    for (const warning of decision.warnings) {
      this.warn(warning, toolName);
    }

    if (decision.allowed) {
      return true;
    }

    const message =
      decision.reason ?? `Tool "${toolName}" was rejected by policy.`;
    if (this.options.strict) {
      throw new WebMcpSecurityPolicyError(message);
    }

    this.warn(message, toolName);
    return false;
  }

  private cleanupRegistration(name: string, browserName: string): void {
    this.registrations.delete(name);
    this.browserNames.delete(browserName);
  }

  private toBrowserTool<TArgs, TResult>(
    tool: WebMcpToolDescriptor<TArgs, TResult>,
    browserName: string,
    signal: AbortSignal,
    source: WebMcpExecutionContext['source'],
  ): BrowserWebMcpToolDescriptor {
    const browserTool: BrowserWebMcpToolDescriptor = {
      name: browserName,
      description: tool.description,
      execute: async (rawArgs: unknown, client = {}) => {
        let args: TArgs;
        try {
          args = tool.validateArgs
            ? tool.validateArgs(rawArgs)
            : (rawArgs as TArgs);
        } catch (error) {
          throw new WebMcpExecutionValidationError(tool.name, error);
        }

        const context: WebMcpExecutionContext = {
          signal: client.signal ?? signal,
          registry: this,
          source,
          toolName: tool.name,
        };
        if (this.options.namespace !== undefined) {
          context.namespace = this.options.namespace;
        }
        if (this.options.getAppContext !== undefined) {
          context.getAppContext = this.options.getAppContext;
        }

        const needsConfirmation =
          this.policies.confirmation.requiresConfirmation(
            tool as WebMcpToolDescriptor,
          ) || tool.confirmBeforeExecute;

        if (needsConfirmation) {
          if (tool.confirmationHandler) {
            const confirmed = await tool.confirmationHandler(tool, args);
            if (!confirmed) {
              throw new WebMcpConfirmationRequiredError(tool.name);
            }
          } else {
            throw new WebMcpConfirmationRequiredError(tool.name);
          }
        }

        this.logEvent('executeStart', { toolName: tool.name, args });
        this.options.onExecuteStart?.(tool.name, args);

        try {
          const rawResult = await tool.execute(args, context);
          const toolRedacted = tool.redactResult
            ? tool.redactResult(rawResult)
            : rawResult;
          const policyRedacted = this.policies.redaction.redact(toolRedacted, {
            kind: 'result',
            path: tool.name,
          });
          const normalized = normalizeWebMcpResult(policyRedacted);
          const maxChars =
            tool.outputBudget ?? this.options.maxOutputChars ?? 1500;
          const budget = applyOutputBudget(
            normalized,
            maxChars,
            this.options.enforceOutputBudget ?? false,
            (message) => this.warn(message, tool.name),
          );
          const output = this.policies.output.enforce(budget.value, {
            toolName: tool.name,
          });
          this.logEvent('executeSuccess', { toolName: tool.name, output });
          this.options.onExecuteSuccess?.(tool.name, output);
          return output;
        } catch (error) {
          this.logEvent('executeError', { toolName: tool.name, error });
          this.options.onExecuteError?.(tool.name, error);
          throw error;
        }
      },
    };

    if (tool.title !== undefined) {
      browserTool.title = tool.title;
    }
    if (tool.inputSchema !== undefined) {
      browserTool.inputSchema = tool.inputSchema;
    }
    if (tool.annotations !== undefined) {
      browserTool.annotations = tool.annotations;
    }

    return browserTool;
  }

  private logEvent(event: string, payload?: unknown): void {
    if (!this.policies.logging.canLog(event, payload)) {
      return;
    }
  }

  private warn(message: string, toolName?: string): void {
    this.options.onSecurityWarning?.(message, toolName);
  }
}

export function createWebMcpRegistry(
  options?: WebMcpRegistryOptions,
): WebMcpRegistry {
  return new WebMcpRegistry(options);
}
