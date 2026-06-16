import { describe, expect, it } from 'vitest';
import { createRouteContextTool } from '@tooluminati/router';
import { createAngularRouterDiagnosticsProvider } from './angular-router';

describe('createAngularRouterDiagnosticsProvider', () => {
  it('omits loader data without an allowlist', () => {
    const provider = createAngularRouterDiagnosticsProvider(() => ({
      url: '/users',
      loaderData: { token: 'secret', count: 3 },
    }));

    const tool = createRouteContextTool(provider);
    const result = tool.execute({}, {} as never);

    expect(result.loaderData).toBeUndefined();
  });

  it('returns only allowlisted loader keys', () => {
    const provider = createAngularRouterDiagnosticsProvider(
      () => ({
        url: '/users',
        loaderData: { token: 'secret', count: 3, label: 'Users' },
      }),
      { loaderAllowlist: ['count', 'label'] },
    );

    const tool = createRouteContextTool(provider);
    const result = tool.execute({}, {} as never);

    expect(result.loaderData).toEqual({ count: 3, label: 'Users' });
  });
});
