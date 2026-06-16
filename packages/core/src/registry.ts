import {
  WebMcpConfirmationRequiredError,
  WebMcpNameCollisionError,
  WebMcpRegistrationError,
  WebMcpUnsupportedError,
} from './errors';
import { getModelContext } from './model-context';
import {
  toBrowserToolName,
  validateToolDescription,
  validateToolName,
} from './name-validation';
import { enforceOutputBudget, normalizeWebMcpResult } from './result';
import { createSecurityWarning, validateExposedOrigins } from './security';
import { anySignal } from './signals';
import type {
  BrowserModelContext,
  BrowserWebMcpToolDescriptor,
  RegisteredWebMcpTool,
  RegisterToolOptions,
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

  constructor(private readonly options: WebMcpRegistryOptions = {}) {
    this.enabled = options.enabled ?? false;
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

    validateExposedOrigins(options.exposedTo);

    const browserName = toBrowserToolName(this.options.namespace, tool.name);
    validateToolName(browserName);
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
    };

    this.registrations.set(tool.name, registration);
    this.browserNames.add(browserName);

    signal.addEventListener(
      'abort',
      () => {
        this.registrations.delete(tool.name);
        this.browserNames.delete(browserName);
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
      this.registrations.delete(tool.name);
      this.browserNames.delete(browserName);
      if (this.options.strict) {
        throw new WebMcpUnsupportedError();
      }
      return registration;
    }

    const browserTool = this.toBrowserTool(tool, browserName, signal, source);

    try {
      const registerOptions =
        options.exposedTo === undefined
          ? { signal }
          : { signal, exposedTo: options.exposedTo };
      void this.modelContext.registerTool(browserTool, registerOptions);
      this.options.onRegister?.(tool as WebMcpToolDescriptor);
    } catch (error) {
      this.registrations.delete(tool.name);
      this.browserNames.delete(browserName);
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

  isEnabled(): boolean {
    return this.enabled;
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
        const args = tool.validateArgs
          ? tool.validateArgs(rawArgs)
          : (rawArgs as TArgs);
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

        if (tool.confirmBeforeExecute || tool.confirmationHandler) {
          const confirmed = tool.confirmationHandler
            ? await tool.confirmationHandler(tool, args)
            : false;
          if (!confirmed) {
            throw new WebMcpConfirmationRequiredError(tool.name);
          }
        }

        this.options.onExecuteStart?.(tool.name, args);

        try {
          const rawResult = await tool.execute(args, context);
          const redacted = tool.redactResult
            ? tool.redactResult(rawResult)
            : rawResult;
          const normalized = normalizeWebMcpResult(redacted);
          const budgeted = enforceOutputBudget(
            normalized,
            this.options.maxOutputChars ?? 1500,
            this.options.enforceOutputBudget ?? false,
          );
          this.options.onExecuteSuccess?.(tool.name, budgeted);
          return budgeted;
        } catch (error) {
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

  private warn(message: string, toolName?: string): void {
    this.options.onSecurityWarning?.(message, toolName);
  }
}

export function createWebMcpRegistry(
  options?: WebMcpRegistryOptions,
): WebMcpRegistry {
  return new WebMcpRegistry(options);
}
