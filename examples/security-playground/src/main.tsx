import { StrictMode, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import {
  classifyTool,
  createSecurityWarning,
  type WebMcpToolDescriptor,
} from '@react-webmcp-diagnostics/core';
import {
  WebMcpProvider,
  WebMcpSecurityBanner,
  useWebMcpTools,
} from '@react-webmcp-diagnostics/react';

const demoTools: WebMcpToolDescriptor[] = [
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

function SecurityPlayground() {
  const warnings = useMemo(
    () =>
      demoTools.map((tool) => ({
        name: tool.name,
        risk: classifyTool(tool),
        warning: createSecurityWarning(tool),
      })),
    [],
  );

  useWebMcpTools(demoTools);

  return (
    <main>
      <WebMcpSecurityBanner />
      <h1>Security Playground</h1>
      <p>Review tool risk classifications before exposing tools to agents.</p>
      <ul>
        {warnings.map((entry) => (
          <li key={entry.name}>
            <strong>{entry.name}</strong> ({entry.risk}) —{' '}
            {entry.warning ?? 'No warning.'}
          </li>
        ))}
      </ul>
    </main>
  );
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <WebMcpProvider enabled={import.meta.env.DEV}>
      <SecurityPlayground />
    </WebMcpProvider>
  </StrictMode>,
);
