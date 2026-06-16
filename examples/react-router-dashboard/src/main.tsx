import { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createActionAvailabilityTool } from '@react-webmcp-diagnostics/diagnostics';
import {
  WebMcpProvider,
  WebMcpScope,
  WebMcpSecurityBanner,
  useWebMcpTool,
} from '@react-webmcp-diagnostics/react';
import {
  createCurrentRouteTool,
  createNavigationStateTool,
  createReactRouterDiagnosticsProvider,
} from '@react-webmcp-diagnostics/router';

const routes = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/dashboard/settings', label: 'Settings' },
];

function DashboardApp() {
  const [pathname, setPathname] = useState('/dashboard');

  const routerProvider = useMemo(
    () =>
      createReactRouterDiagnosticsProvider(() => ({
        location: { pathname, search: '', hash: '' },
        params:
          pathname === '/dashboard/settings' ? { tab: 'profile' } : undefined,
        matches: [{ id: 'root', pathname }],
        navigation: { state: 'idle', location: { pathname } },
      })),
    [pathname],
  );

  const exportActions = useMemo(
    () => ({
      getActionAvailability(actionId: string) {
        if (actionId !== 'export-report') {
          return undefined;
        }

        return {
          actionId,
          label: 'Export report',
          available: false,
          reasons: ['Export is disabled in this demo environment.'],
          category: 'admin',
        };
      },
      listActions() {
        return [
          {
            actionId: 'export-report',
            label: 'Export report',
            available: false,
            reasons: ['Export is disabled in this demo environment.'],
          },
        ];
      },
    }),
    [],
  );

  useWebMcpTool(createActionAvailabilityTool(exportActions));

  const routeTools = useMemo(
    () => [
      createCurrentRouteTool(routerProvider),
      createNavigationStateTool(routerProvider),
    ],
    [routerProvider],
  );

  return (
    <main>
      <WebMcpSecurityBanner />
      <h1>Router Dashboard</h1>
      <nav>
        {routes.map((route) => (
          <button
            key={route.path}
            type="button"
            onClick={() => setPathname(route.path)}
          >
            {route.label}
          </button>
        ))}
      </nav>
      <p>Current route: {pathname}</p>
      <button disabled>Export report</button>
      <WebMcpScope tools={routeTools} source="route" namespaceSegment="route">
        <section>
          <h2>Route-scoped tools</h2>
          <p>Route tools are registered under the route.* namespace.</p>
        </section>
      </WebMcpScope>
    </main>
  );
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <WebMcpProvider enabled={import.meta.env.DEV}>
      <DashboardApp />
    </WebMcpProvider>
  </StrictMode>,
);
