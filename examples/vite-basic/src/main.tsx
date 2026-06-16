import { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createActionAvailabilityTool,
  createAppInfoTool,
  createVisibleToolsTool,
  type ActionAvailabilityProvider,
} from '@react-webmcp-diagnostics/diagnostics';
import { WebMcpProvider, useWebMcpTools } from '@react-webmcp-diagnostics/react';

function Demo() {
  const [dirty, setDirty] = useState(false);

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
    ],
    [actions],
  );

  return (
    <main>
      <h1>React WebMCP Diagnostics</h1>
      <p>
        This example exposes app info, visible tools, and action availability.
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
