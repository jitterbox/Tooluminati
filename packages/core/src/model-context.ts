import type { BrowserModelContext } from './types';

interface DocumentWithModelContext extends Document {
  modelContext?: BrowserModelContext;
}

interface NavigatorWithModelContext extends Navigator {
  modelContext?: BrowserModelContext;
}

export interface GetModelContextOptions {
  globalObject?: typeof globalThis;
  allowNavigatorFallback?: boolean;
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
  if (documentContext) {
    return documentContext;
  }

  if (options.allowNavigatorFallback === false) {
    return undefined;
  }

  return (globalObject.navigator as NavigatorWithModelContext | undefined)
    ?.modelContext;
}

export function isWebMcpSupported(
  options: GetModelContextOptions = {},
): boolean {
  return getModelContext(options) !== undefined;
}
