import { createRoot } from 'react-dom/client';
import { useMemo, useState } from 'react';
import { redactObject } from '@react-webmcp-diagnostics/core';
import {
  createActionAvailabilityTool,
  createAppInfoTool,
  type AppInfo,
} from '@react-webmcp-diagnostics/diagnostics';
import { localDevPolicy } from '@react-webmcp-diagnostics/policies';
import {
  WebMcpProvider,
  WebMcpSecurityBanner,
  useWebMcpTool,
} from '@react-webmcp-diagnostics/react';

function Quickstart() {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [displayInfo, setDisplayInfo] = useState<AppInfo | null>(null);

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

  const appInfo = useMemo(
    () => ({
      name: 'Diagnostics Quickstart',
      environment: import.meta.env.MODE,
      apiToken: 'secret-demo-token',
      supportEmail: 'agent@example.com',
    }),
    [],
  );

  useWebMcpTool(createActionAvailabilityTool(provider), [provider]);
  useWebMcpTool(createAppInfoTool(() => appInfo));

  return (
    <main>
      <WebMcpSecurityBanner />
      <label>
        <input
          checked={acceptedTerms}
          onChange={(event) => setAcceptedTerms(event.currentTarget.checked)}
          type="checkbox"
        />
        Accept terms
      </label>
      <button disabled={!acceptedTerms}>Continue</button>
      <button type="button" onClick={() => setDisplayInfo(appInfo)}>
        Show redacted app info
      </button>
      {displayInfo ? (
        <pre>{JSON.stringify(redactObject(displayInfo), null, 2)}</pre>
      ) : null}
    </main>
  );
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <WebMcpProvider enabled={import.meta.env.DEV} policies={localDevPolicy}>
    <Quickstart />
  </WebMcpProvider>,
);
