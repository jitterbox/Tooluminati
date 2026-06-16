import { describe, expect, it } from 'vitest';
import { createReactRouterDiagnosticsProvider } from './react-router';
import { createRouteContextTool } from './tools';

describe('router diagnostics', () => {
  it('omits loader data without an allowlist', () => {
    const provider = createReactRouterDiagnosticsProvider(() => ({
      location: { pathname: '/users' },
      loaderData: { token: 'secret', count: 3 },
    }));

    const tool = createRouteContextTool(provider);
    const result = tool.execute({}, {} as never);

    expect(result.loaderData).toBeUndefined();
  });

  it('returns only allowlisted loader keys', () => {
    const provider = createReactRouterDiagnosticsProvider(
      () => ({
        location: { pathname: '/users' },
        loaderData: { token: 'secret', count: 3, label: 'Users' },
      }),
      { loaderAllowlist: ['count', 'label'] },
    );

    const tool = createRouteContextTool(provider);
    const result = tool.execute({}, {} as never);

    expect(result.loaderData).toEqual({ count: 3, label: 'Users' });
    expect(result.loaderData).not.toHaveProperty('token');
  });
});
