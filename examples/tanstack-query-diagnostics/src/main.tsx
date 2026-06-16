import { StrictMode, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import {
  WebMcpProvider,
  WebMcpSecurityBanner,
  useWebMcpTool,
} from '@tooluminati/react';
import {
  createQueryCacheSummaryTool,
  type QueryClientLike,
} from '@tooluminati/state';

function QueryDiagnosticsDemo() {
  const queryClient = useMemo<QueryClientLike>(
    () => ({
      getQueryCache: () => ({
        findAll: () => [
          {
            queryKey: ['users'],
            state: {
              status: 'success',
              fetchStatus: 'idle',
              data: { items: [{ id: 1 }, { id: 2 }] },
              dataUpdatedAt: Date.now(),
            },
            isStale: () => false,
          },
          {
            queryKey: ['internal-secrets'],
            state: {
              status: 'success',
              fetchStatus: 'idle',
              data: { token: 'hidden' },
            },
            isStale: () => true,
          },
        ],
      }),
    }),
    [],
  );

  useWebMcpTool(
    createQueryCacheSummaryTool({
      queryClient,
      allowKeys: [['users']],
    }),
  );

  return (
    <main>
      <WebMcpSecurityBanner />
      <h1>TanStack Query Diagnostics</h1>
      <p>
        Only the allowlisted <code>['users']</code> query key is exposed via
        WebMCP.
      </p>
    </main>
  );
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <WebMcpProvider enabled={import.meta.env.DEV}>
      <QueryDiagnosticsDemo />
    </WebMcpProvider>
  </StrictMode>,
);
