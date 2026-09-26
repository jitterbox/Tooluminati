import {
  getModelContext,
  isUsableModelContext,
  isWebMcpSupported,
  type WebMcpRegistry,
  type WebMcpToolDescriptor,
} from '@tooluminati/core';

export interface WebMcpEnvironmentCheck {
  id: string;
  label: string;
  value: string;
  status: 'ok' | 'warn' | 'fail' | 'muted';
  hint?: string | undefined;
}

export interface WebMcpEnvironmentSummary {
  supported: boolean;
  toolCount: number;
  origin: string;
  usingNavigatorFallback: boolean;
  registerToolAvailable: boolean;
  consumers: string[];
  checks: WebMcpEnvironmentCheck[];
  warnings: string[];
}

export interface WebMcpEnvironmentSummaryOptions {
  registry?: WebMcpRegistry | undefined;
  globalObject?: typeof globalThis;
}

const WEBMCP_CONSUMERS = [
  'Chrome DevTools / Model Context Inspector',
  'ChatGPT Site tools (imperative registerTool only)',
  'Safari/Firefox: no native WebMCP',
];

export function createWebMcpEnvironmentSummary(
  options: WebMcpEnvironmentSummaryOptions = {},
): WebMcpEnvironmentSummary {
  const globalObject = options.globalObject ?? globalThis;
  let usingNavigatorFallback = false;
  const documentContext =
    typeof globalObject.document !== 'undefined'
      ? (globalObject.document as Document & { modelContext?: unknown })
          .modelContext
      : undefined;
  const modelContext = getModelContext({
    globalObject,
    onNavigatorFallback: () => {
      usingNavigatorFallback = true;
    },
  });
  const supported = isWebMcpSupported({ globalObject });
  const registerToolAvailable = isUsableModelContext(modelContext);
  const origin =
    typeof globalObject.location !== 'undefined'
      ? globalObject.location.origin
      : 'unknown';
  const toolCount = options.registry?.getRegisteredToolNames().length ?? 0;
  const checks: WebMcpEnvironmentCheck[] = [];
  const warnings: string[] = [];
  const documentContextStatus = isUsableModelContext(documentContext)
    ? 'ok'
    : supported
      ? 'warn'
      : 'fail';

  checks.push({
    id: 'document.modelContext',
    label: 'document.modelContext',
    value: isUsableModelContext(documentContext)
      ? 'available'
      : supported
        ? 'missing; using fallback'
        : 'missing',
    status: documentContextStatus,
    ...(documentContextStatus === 'ok'
      ? {}
      : {
          hint: supported
            ? 'No document.modelContext.registerTool on this page, ' +
              'but WebMCP is available through navigator.modelContext ' +
              'in this Chrome build.'
            : 'No document.modelContext.registerTool on this page. ' +
              'Enable WebMCP in Chrome or attach the Model Context ' +
              'Inspector Extension.',
        }),
  });

  checks.push({
    id: 'registerTool',
    label: 'registerTool',
    value: registerToolAvailable ? 'available' : 'missing',
    status: registerToolAvailable ? 'ok' : 'fail',
    ...(registerToolAvailable
      ? {}
      : {
          hint:
            'Feature-detect typeof modelContext.registerTool === ' +
            '"function" before registering tools.',
        }),
  });

  checks.push({
    id: 'navigator.modelContext',
    label: 'navigator.modelContext fallback',
    value: usingNavigatorFallback ? 'in use' : 'not used',
    status: usingNavigatorFallback ? 'warn' : 'ok',
    ...(usingNavigatorFallback
      ? {
          hint:
            'Deprecated navigator.modelContext path detected. Migrate ' +
            'to document.modelContext.',
        }
      : {}),
  });

  checks.push({
    id: 'origin-trial',
    label: 'Origin trial / flag',
    value: 'required until the API ships',
    status: 'muted',
    hint:
      'Chrome 149–156 need #enable-webmcp-testing or an Origin-Trial ' +
      'token. Chrome 157 is a target, not a ship contract.',
  });

  const originIsolation = detectOriginIsolationIssue(globalObject);
  checks.push({
    id: 'origin-isolation',
    label: 'Origin isolation',
    value: originIsolation.value,
    status: originIsolation.status,
    ...(originIsolation.hint ? { hint: originIsolation.hint } : {}),
  });
  if (originIsolation.warning) {
    warnings.push(originIsolation.warning);
  }

  const permissionsPolicy = detectPermissionsPolicy(globalObject);
  checks.push({
    id: 'permissions-policy',
    label: 'tools Permissions-Policy',
    value: permissionsPolicy.value,
    status: permissionsPolicy.status,
    ...(permissionsPolicy.hint ? { hint: permissionsPolicy.hint } : {}),
  });
  if (permissionsPolicy.warning) {
    warnings.push(permissionsPolicy.warning);
  }

  checks.push({
    id: 'consumers',
    label: 'Known agent consumers',
    value: WEBMCP_CONSUMERS.join('; '),
    status: 'muted',
    hint:
      'Treat tools as progressive enhancement. Declarative forms are ' +
      'Chrome-only today; ChatGPT Site tools see registerTool only.',
  });

  if (toolCount === 0 && supported) {
    warnings.push('No tools registered yet.');
    checks.push({
      id: 'tool-count',
      label: 'Registered tools',
      value: '0',
      status: 'warn',
      hint:
        'WebMCP is supported but no tools are registered. Verify the ' +
        'Tooluminati provider is mounted.',
    });
  }

  if (!supported) {
    warnings.push('WebMCP is unsupported in this browser context.');
  }

  return {
    supported,
    toolCount,
    origin,
    usingNavigatorFallback,
    registerToolAvailable,
    consumers: WEBMCP_CONSUMERS,
    checks,
    warnings,
  };
}

function detectOriginIsolationIssue(globalObject: typeof globalThis): {
  value: string;
  status: 'ok' | 'warn' | 'fail' | 'muted';
  hint?: string;
  warning?: string;
} {
  if (typeof globalObject.document === 'undefined') {
    return { value: 'n/a', status: 'muted' };
  }

  const doc = globalObject.document as Document & { domain?: string };
  if (doc.domain && doc.domain.length > 0) {
    const hint =
      'document.domain is set. Origin-Agent-Cluster may be ?0. Remove ' +
      'document.domain writes or set Origin-Agent-Cluster: ?1.';
    return {
      value: 'review',
      status: 'warn',
      hint,
      warning: hint,
    };
  }

  return { value: 'ok', status: 'ok' };
}

function detectPermissionsPolicy(globalObject: typeof globalThis): {
  value: string;
  status: 'ok' | 'warn' | 'fail' | 'muted';
  hint?: string;
  warning?: string;
} {
  if (typeof globalObject.document === 'undefined') {
    return { value: 'n/a', status: 'muted' };
  }

  const doc = globalObject.document as Document & {
    permissionsPolicy?: { allowsFeature?: (feature: string) => boolean };
  };
  if (doc.permissionsPolicy?.allowsFeature) {
    const allowed = doc.permissionsPolicy.allowsFeature('tools');
    if (!allowed) {
      const hint =
        'tools is blocked by Permissions-Policy. Allow tools for this ' +
        'origin or review iframe allow attributes.';
      return {
        value: 'blocked',
        status: 'fail',
        hint,
        warning: hint,
      };
    }
  }

  if (typeof globalObject.document.querySelector !== 'function') {
    return { value: 'self', status: 'ok' };
  }
  const iframe = globalObject.document.querySelector('iframe');
  if (
    iframe &&
    iframe.src &&
    !iframe.src.startsWith(globalObject.location.origin)
  ) {
    const hint =
      'Cross-origin iframe detected. Verify Permissions-Policy allows ' +
      'tools for embedded origins.';
    return {
      value: 'review cross-origin iframe',
      status: 'warn',
      hint,
      warning: hint,
    };
  }
  return { value: 'self', status: 'ok' };
}

export function createWebMcpEnvironmentTool(
  getSummary: () => WebMcpEnvironmentSummary,
  name = 'get_webmcp_environment',
): WebMcpToolDescriptor<Record<string, never>, WebMcpEnvironmentSummary> {
  return {
    name,
    description:
      'Reports WebMCP browser support, registered tool count, and setup warnings.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, debugging: true },
    execute: () => getSummary(),
  };
}
