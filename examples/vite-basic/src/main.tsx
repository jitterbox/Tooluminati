import { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { WebMcpToolDescriptor } from '@react-webmcp-diagnostics/core';
import {
  createActionAvailabilityTool,
  createAppInfoTool,
  createVisibleToolsTool,
  type ActionAvailabilityProvider,
} from '@react-webmcp-diagnostics/diagnostics';
import {
  WebMcpProvider,
  WebMcpSecurityBanner,
  useWebMcpTools,
} from '@react-webmcp-diagnostics/react';

function createPageStateTool(
  getState: () => { title: string; dirty: boolean },
): WebMcpToolDescriptor<Record<string, never>, { title: string; dirty: boolean }> {
  return {
    name: 'get_page_state',
    description: 'Returns a safe summary of the current page title and form state.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    execute: () => getState(),
  };
}

function Demo() {
  const [dirty, setDirty] = useState(false);
  const pageTitle = 'React WebMCP Diagnostics';

  const actions = useMemo<ActionAvailabilityProvider>(
    () => ({
      getActionAvailability(actionId) {
        if (actionId !== 'save-profile') {
          return undefined;
        }

        return {
          actionId,
          label: 'Save profile',
          available: dirty,
          reasons: dirty ? [] : ['No profile changes have been made.'],
          category: 'form',
        };
      },
      listActions() {
        return [
          {
            actionId: 'save-profile',
            label: 'Save profile',
            available: dirty,
            reasons: dirty ? [] : ['No profile changes have been made.'],
          },
        ];
      },
    }),
    [dirty],
  );

  useWebMcpTools(
    [
      createAppInfoTool(() => ({
        name: 'Vite Basic',
        version: '0.0.0',
        environment: import.meta.env.MODE,
        webMcpEnabled: import.meta.env.DEV,
      })),
      createVisibleToolsTool(),
      createActionAvailabilityTool(actions),
      createPageStateTool(() => ({ title: pageTitle, dirty })),
    ],
    [actions, dirty],
  );

  return (
    <main>
      <WebMcpSecurityBanner />
      <h1>{pageTitle}</h1>
      <p>
        This example exposes app info, visible tools, action availability,
        and page state.
      </p>
      <button onClick={() => setDirty(true)}>Make profile dirty</button>
      <button disabled={!dirty}>Save profile</button>
    </main>
  );
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <WebMcpProvider enabled={import.meta.env.DEV}>
      <Demo />
    </WebMcpProvider>
  </StrictMode>,
);
