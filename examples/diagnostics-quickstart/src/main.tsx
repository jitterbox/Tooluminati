import { createRoot } from 'react-dom/client';
import { useMemo, useState } from 'react';
import {
  createActionAvailabilityTool,
  createAppInfoTool,
} from '@react-webmcp-diagnostics/diagnostics';
import { localDevPolicy } from '@react-webmcp-diagnostics/policies';
import { WebMcpProvider, useWebMcpTool } from '@react-webmcp-diagnostics/react';

function Quickstart() {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const provider = useMemo(
    () => ({
      getActionAvailability(actionId: string) {
        return {
          actionId,
          label: 'Continue',
          available: acceptedTerms,
          reasons: acceptedTerms ? [] : ['Terms must be accepted first.'],
        };
      },
    }),
    [acceptedTerms],
  );

  useWebMcpTool(createActionAvailabilityTool(provider), [provider]);
  useWebMcpTool(
    createAppInfoTool(() => ({
      name: 'Diagnostics Quickstart',
      environment: import.meta.env.MODE,
    })),
  );

  return (
    <main>
      <label>
        <input
          checked={acceptedTerms}
          onChange={(event) => setAcceptedTerms(event.currentTarget.checked)}
          type="checkbox"
        />
        Accept terms
      </label>
      <button disabled={!acceptedTerms}>Continue</button>
    </main>
  );
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <WebMcpProvider enabled={import.meta.env.DEV} policies={localDevPolicy}>
    <Quickstart />
  </WebMcpProvider>,
);
