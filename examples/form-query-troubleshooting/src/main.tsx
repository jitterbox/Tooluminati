import { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { QuerySummary } from '@tooluminati/diagnostics';
import {
  WebMcpTroubleshootingProvider,
  WebMcpForm,
  WebMcpInput,
  createFormSubmitBlockersProvider,
  useTanStackQueryWebMcpTools,
} from '@tooluminati/react-troubleshooting';

const client = new QueryClient();

function FormPanel({
  email,
  setEmail,
}: {
  email: string;
  setEmail: (value: string) => void;
}) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      throw new Error('Profile unavailable');
    },
    retry: false,
  });

  useTanStackQueryWebMcpTools(queryClient, {
    allowKeys: [['profile']],
  });

  return (
    <WebMcpForm
      toolName="update_profile"
      toolDescription="Update the signed-in user's profile email"
    >
      <label>
        Email
        <WebMcpInput
          name="email"
          value={email}
          toolParamDescription="Primary contact email"
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <button
        type="button"
        disabled={!email.includes('@') || query.isError}
        data-testid="save-profile"
      >
        Save profile
      </button>
    </WebMcpForm>
  );
}

function AppContent() {
  const [email, setEmail] = useState('');
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      throw new Error('Profile unavailable');
    },
    retry: false,
  });

  const actionProvider = useMemo(
    () =>
      createFormSubmitBlockersProvider({
        actionId: 'save-profile',
        label: 'Save profile',
        getFormSummary: () => ({
          name: 'profile-form',
          errors: email.includes('@')
            ? []
            : [{ path: 'email', message: 'Enter a valid email.' }],
        }),
        getExtraReasons: () =>
          query.isError ? ['Profile query failed. Retry before saving.'] : [],
      }),
    [email, query.isError],
  );

  const querySummaries = useMemo(
    () => (): QuerySummary[] => {
      const state = queryClient.getQueryState(['profile']);
      return [
        {
          queryKey: JSON.stringify(['profile']),
          status: state?.status ?? 'pending',
          ...(state?.error instanceof Error
            ? { error: state.error.message }
            : {}),
          isFetching: state?.fetchStatus === 'fetching',
        },
      ];
    },
    [queryClient, query.status, query.isError, query.isFetching],
  );

  return (
    <WebMcpTroubleshootingProvider
      enabled
      actionProvider={actionProvider}
      querySummaries={querySummaries}
      panel={{ enabled: true, render: 'auto', startCollapsed: true }}
    >
      <main style={{ fontFamily: 'system-ui', padding: 24 }}>
        <h1>Form + query troubleshooting</h1>
        <FormPanel email={email} setEmail={setEmail} />
      </main>
    </WebMcpTroubleshootingProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={client}>
      <AppContent />
    </QueryClientProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
