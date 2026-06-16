import {
  EnvironmentProviders,
  isDevMode,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import {
  classifyTool,
  createSecurityWarning,
  type WebMcpToolDescriptor,
} from '@tooluminati/core';
import { createVisibleToolsTool } from '@tooluminati/diagnostics';
import { ciStrictPolicy } from '@tooluminati/policies';
import {
  provideWebMcpRegistry,
  registerWebMcpTools,
} from '@tooluminati/angular';

export const demoTools: WebMcpToolDescriptor[] = [
  {
    name: 'safe_read_snapshot',
    description: 'Read-only snapshot of public page metadata.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    execute: () => ({ ok: true }),
  },
  {
    name: 'unsafe_delete_records',
    description: 'Deletes records without confirmation in this demo.',
    inputSchema: {
      type: 'object',
      properties: { ids: { type: 'array', items: { type: 'string' } } },
      required: ['ids'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false },
    meta: { sensitive: true },
    execute: () => 'Deleted (demo only).',
  },
  {
    name: 'untrusted_html_preview',
    description: 'Returns untrusted HTML content from user input.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: { untrustedContentHint: true },
    execute: () => ({ html: '<script>alert(1)</script>' }),
  },
];

export function provideSecurityTools(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      registerWebMcpTools(
        [
          ...demoTools,
          createVisibleToolsTool() as WebMcpToolDescriptor,
        ],
        { source: 'scope' },
      );
    }),
  ]);
}

export function describeToolRisk(tool: WebMcpToolDescriptor) {
  const risk = classifyTool(tool);
  return {
    name: tool.name,
    risk,
    warning: createSecurityWarning(tool, risk),
  };
}

export const appProviders = [
  provideWebMcpRegistry({
    enabled: isDevMode(),
    policies: ciStrictPolicy,
  }),
  provideSecurityTools(),
];
