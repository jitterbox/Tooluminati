import { isDevMode, signal } from '@angular/core';
import { provideWebMcpRegistry } from '@tooluminati/angular';
import { provideSignalStateWebMcpTools } from '@tooluminati/angular-state';

interface QueryEntry {
  key: string;
  status: string;
  stale: boolean;
  itemCount?: number;
}

interface AppState {
  queries: QueryEntry[];
  secrets: { token: string };
}

export const appState = signal<AppState>({
  queries: [
    {
      key: 'users',
      status: 'success',
      stale: false,
      itemCount: 2,
    },
    {
      key: 'internal-secrets',
      status: 'success',
      stale: true,
    },
  ],
  secrets: { token: 'hidden' },
});

export const appProviders = [
  provideWebMcpRegistry({ enabled: isDevMode() }),
  provideSignalStateWebMcpTools({
    state: appState,
    name: 'get_signal_state_summary',
    description:
      'Returns safe query health for allowlisted keys only.',
    selector: (state) => ({
      queries: state.queries
        .filter((entry) => entry.key === 'users')
        .map(({ key, status, stale, itemCount }) => ({
          key,
          status,
          stale,
          itemCount,
        })),
    }),
  }),
];
