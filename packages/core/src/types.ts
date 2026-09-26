export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];

export interface JsonObject {
  [key: string]: JsonValue;
}

export type JsonSchema =
  | boolean
  | {
      type?: 'object' | 'string' | 'number' | 'integer' | 'boolean' | 'array';
      title?: string;
      description?: string;
      properties?: Record<string, JsonSchema>;
      required?: string[];
      additionalProperties?: boolean | JsonSchema;
      items?: JsonSchema;
      enum?: JsonValue[];
      const?: JsonValue;
      oneOf?: JsonSchema[];
      anyOf?: JsonSchema[];
      allOf?: JsonSchema[];
      default?: JsonValue;
      minimum?: number;
      maximum?: number;
      minLength?: number;
      maxLength?: number;
      pattern?: string;
      format?: string;
      minItems?: number;
      maxItems?: number;
    };

export interface WebMcpToolAnnotations {
  readOnlyHint?: boolean;
  untrustedContentHint?: boolean;
  consequentialHint?: boolean;
  debugging?: boolean;
  [key: string]: unknown;
}

export interface WebMcpClientContext {
  signal: AbortSignal;
}

export type WebMcpToolSource =
  | 'provider'
  | 'hook'
  | 'scope'
  | 'route'
  | 'form'
  | 'diagnostic'
  | 'manual';

export interface WebMcpExecutionContext extends WebMcpClientContext {
  registry: WebMcpRegistryLike;
  source: WebMcpToolSource;
  toolName: string;
  namespace?: string | undefined;
  getAppContext?: (() => unknown) | undefined;
}

export type WebMcpExecute<TArgs = unknown, TResult = unknown> = (
  args: TArgs,
  context: WebMcpExecutionContext,
) => TResult | Promise<TResult>;

export interface WebMcpToolDescriptor<TArgs = unknown, TResult = unknown> {
  name: string;
  title?: string | undefined;
  description: string;
  inputSchema?: JsonSchema | undefined;
  annotations?: WebMcpToolAnnotations | undefined;
  execute: WebMcpExecute<TArgs, TResult>;
  validateArgs?: ((args: unknown) => TArgs) | undefined;
  redactResult?: ((result: TResult) => unknown) | undefined;
  confirmBeforeExecute?: boolean;
  confirmationHandler?: (
    tool: WebMcpToolDescriptor<TArgs, TResult>,
    args: TArgs,
  ) => boolean | Promise<boolean>;
  meta?: {
    owner?: string;
    scope?: string;
    tags?: string[];
    sensitive?: boolean;
    readOnly?: boolean;
  };
  securityLevel?: 'low' | 'medium' | 'high' | undefined;
  outputBudget?: number | undefined;
}

export interface BrowserWebMcpToolDescriptor {
  name: string;
  title?: string | undefined;
  description: string;
  inputSchema?: JsonSchema | undefined;
  annotations?: WebMcpToolAnnotations | undefined;
  execute: (args: unknown, client?: Partial<WebMcpClientContext>) => unknown;
}

export interface WebMcpRegisterToolOptions {
  signal?: AbortSignal | undefined;
  exposedTo?: string[] | undefined;
}

export interface WebMcpGetToolsOptions {
  fromOrigins?: string[] | undefined;
}

export interface WebMcpExecuteToolOptions {
  signal?: AbortSignal | undefined;
}

export interface BrowserRegisteredTool {
  name: string;
  title?: string | undefined;
  description?: string | undefined;
  inputSchema?: JsonSchema | undefined;
  annotations?: WebMcpToolAnnotations | undefined;
  origin?: string | undefined;
}

export interface BrowserModelContext extends EventTarget {
  registerTool(
    tool: BrowserWebMcpToolDescriptor,
    options?: WebMcpRegisterToolOptions,
  ): void | Promise<void>;
  getTools?(
    options?: WebMcpGetToolsOptions,
  ): Promise<BrowserRegisteredTool[]>;
  executeTool?(
    tool: BrowserRegisteredTool | unknown,
    input?: object | string,
    options?: WebMcpExecuteToolOptions,
  ): Promise<unknown>;
  ontoolchange?: ((event: Event) => void) | null;
}

/** @deprecated Use BrowserModelContext. Kept for existing test mocks. */
export type BrowserModelContextTestingExtensions = BrowserModelContext;

export interface RegisteredWebMcpTool {
  name: string;
  browserName: string;
  source: WebMcpToolSource;
  signal: AbortSignal;
  abort: () => void;
  ready: Promise<void>;
  title?: string | undefined;
  description: string;
  annotations?: WebMcpToolAnnotations | undefined;
}

export interface VisibleToolSummary {
  name: string;
  browserName: string;
  source: WebMcpToolSource;
  title?: string | undefined;
  description: string;
  annotations?: WebMcpToolAnnotations | undefined;
}

export interface WebMcpRegistryLike {
  getRegisteredToolNames(): string[];
  getVisibleToolSummaries(): VisibleToolSummary[];
  unregisterTool(name: string): void;
}

import type { PolicyContext, WebMcpPolicySet } from './policy-types';

export interface WebMcpRegistryOptions {
  enabled?: boolean;
  strict?: boolean;
  namespace?: string | undefined;
  allowNavigatorFallback?: boolean;
  validateExposedTo?: boolean;
  maxOutputChars?: number;
  maxDescriptionChars?: number;
  enforceOutputBudget?: boolean;
  policies?: WebMcpPolicySet | undefined;
  policyContext?: PolicyContext | undefined;
  getAppContext?: (() => unknown) | undefined;
  modelContext?: BrowserModelContext | undefined;
  onRegister?: ((tool: WebMcpToolDescriptor) => void) | undefined;
  onUnregister?: ((name: string) => void) | undefined;
  onExecuteStart?: ((name: string, args: unknown) => void) | undefined;
  onExecuteSuccess?: ((name: string, result: unknown) => void) | undefined;
  onExecuteError?: ((name: string, error: unknown) => void) | undefined;
  onSecurityWarning?:
    | ((message: string, toolName?: string) => void)
    | undefined;
  onError?:
    | ((
        error: unknown,
        context: { operation: string; toolName?: string },
      ) => void)
    | undefined;
}

export interface RegisterToolOptions extends WebMcpRegisterToolOptions {
  source?: WebMcpToolSource;
}
