import type { BrowserModelContext } from './types';

interface DocumentWithModelContext extends Document {
  modelContext?: unknown;
}

interface NavigatorWithModelContext extends Navigator {
  modelContext?: unknown;
}

export interface GetModelContextOptions {
  globalObject?: typeof globalThis;
  allowNavigatorFallback?: boolean;
  onNavigatorFallback?: () => void;
}

export function isUsableModelContext(
  value: unknown,
): value is BrowserModelContext {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as BrowserModelContext).registerTool === 'function'
  );
}

export function getModelContext(
  options: GetModelContextOptions = {},
): BrowserModelContext | undefined {
  const globalObject = options.globalObject ?? globalThis;

  if (
    typeof globalObject.window === 'undefined' ||
    typeof globalObject.document === 'undefined'
  ) {
    return undefined;
  }

  const documentContext = (globalObject.document as DocumentWithModelContext)
    .modelContext;
  if (isUsableModelContext(documentContext)) {
    return documentContext;
  }

  if (options.allowNavigatorFallback === false) {
    return undefined;
  }

  const navigatorContext = (
    globalObject.navigator as NavigatorWithModelContext | undefined
  )?.modelContext;

  if (isUsableModelContext(navigatorContext)) {
    options.onNavigatorFallback?.();
    if (
      typeof process !== 'undefined' &&
      process.env.NODE_ENV !== 'production'
    ) {
      console.warn(
        '[tooluminati] Using deprecated navigator.modelContext ' +
          'fallback. Prefer document.modelContext.',
      );
    }
    return navigatorContext;
  }

  return undefined;
}

export function isWebMcpSupported(
  options: GetModelContextOptions = {},
): boolean {
  return getModelContext(options) !== undefined;
}
