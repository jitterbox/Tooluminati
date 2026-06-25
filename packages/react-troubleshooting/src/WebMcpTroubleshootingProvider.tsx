import {
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import type { WebMcpRegistry, WebMcpToolDescriptor } from '@tooluminati/core';
import {
  ClientErrorBuffer,
  TroubleshootingTimelineBuffer,
  createErrorCollector,
  createFetchFailureTracker,
  createActionAvailabilityTool,
  createListActionsTool,
  createMountedFormsRegistry,
  createMountedFormsSummaryTool,
  createRecentClientErrorsTool,
  createTimelineFromErrorBuffer,
  createTroubleshootingPanelViewModel,
  createTroubleshootingTimelineTool,
  createWebMcpEnvironmentSummary,
  createWebMcpEnvironmentTool,
  createWebMcpLifecycleCollector,
  createWorkflowBlockersTool,
  discoverDeclarativeForms,
  formSummaryFromMounted,
  isPanelEnabledByDefault,
  isPanelUrlOverrideEnabled,
  type ActionAvailabilityProvider,
  type QuerySummary,
} from '@tooluminati/diagnostics';
import {
  WebMcpProvider,
  useWebMcpRegistry,
  type WebMcpProviderProps,
} from '@tooluminati/react';
import { WebMcpTroubleshootingContext } from './WebMcpTroubleshootingContext';
import { WebMcpTroubleshootingPanel } from './WebMcpTroubleshootingPanel';
import {
  getPanelVisibilityController,
  resetPanelVisibilityController,
  wirePanelVisibilityController,
} from './panel-visibility';

export interface WebMcpTroubleshootingPanelOptions {
  enabled?: boolean | 'auto';
  render?: boolean | 'auto';
  position?: 'br' | 'bl' | 'tr' | 'tl';
  startCollapsed?: boolean;
  pollMs?: number | null;
  allowUrlOverride?: boolean;
  eventLimit?: number;
}

export interface WebMcpTroubleshootingProviderProps
  extends Omit<WebMcpProviderProps, 'tools'> {
  children: ReactNode;
  actionProvider?: ActionAvailabilityProvider;
  querySummaries?: () => QuerySummary[];
  trackFetchFailures?: boolean;
  panel?: WebMcpTroubleshootingPanelOptions;
  tools?: WebMcpProviderProps['tools'];
  extraTools?: WebMcpProviderProps['tools'];
}

interface InnerProps {
  children: ReactNode;
  timeline: TroubleshootingTimelineBuffer;
  errors: ClientErrorBuffer;
  mountedForms: ReturnType<typeof createMountedFormsRegistry>;
  actionProvider?: ActionAvailabilityProvider;
  querySummaries?: () => QuerySummary[];
  trackFetchFailures: boolean;
  panel?: WebMcpTroubleshootingPanelOptions;
  panelEnabled: boolean;
}

function WebMcpTroubleshootingInner({
  children,
  timeline,
  errors,
  mountedForms,
  trackFetchFailures,
  panel,
  panelEnabled,
  registryRef,
}: InnerProps & { registryRef: { current: WebMcpRegistry | undefined } }) {
  const registry = useWebMcpRegistry();
  useEffect(() => {
    registryRef.current = registry;
  }, [registry, registryRef]);
  const visibility = useMemo(() => {
    const controller = getPanelVisibilityController();
    wirePanelVisibilityController(controller);
    if (panel?.startCollapsed) {
      controller.setCollapsed(true);
    }
    return controller;
  }, [panel?.startCollapsed]);

  const viewModel = useMemo(
    () =>
      createTroubleshootingPanelViewModel(
        {
          timeline,
          errors,
          environment: () => createWebMcpEnvironmentSummary({ registry }),
          registry,
        },
        {
          pollMs: panel?.pollMs ?? 2000,
          registry,
          ...(panel?.eventLimit !== undefined
            ? { eventLimit: panel.eventLimit }
            : {}),
        },
      ),
    [timeline, errors, registry, panel?.eventLimit, panel?.pollMs],
  );

  useEffect(() => {
    const cleanups = [
      createErrorCollector({ buffer: errors }),
      createTimelineFromErrorBuffer(errors, timeline),
      createWebMcpLifecycleCollector({ buffer: timeline }),
    ];
    if (trackFetchFailures) {
      cleanups.push(createFetchFailureTracker({ buffer: timeline }));
    }
    return () => {
      for (const cleanup of cleanups) {
        cleanup();
      }
      viewModel.dispose();
    };
  }, [errors, timeline, trackFetchFailures, viewModel]);

  const shouldRenderPanel =
    panelEnabled &&
    panel?.render !== false &&
    (panel?.render === true ||
      panel?.render === 'auto' ||
      panel?.render === undefined);

  const contextValue = useMemo(
    () => ({
      timeline,
      errors,
      mountedForms,
      viewModel,
      visibility,
      isPanelEnabled: panelEnabled,
    }),
    [timeline, errors, mountedForms, viewModel, visibility, panelEnabled],
  );

  return (
    <WebMcpTroubleshootingContext.Provider value={contextValue}>
      {children}
      {shouldRenderPanel ? (
        <WebMcpTroubleshootingPanel
          position={panel?.position ?? 'br'}
          {...(panel?.startCollapsed !== undefined
            ? { startCollapsed: panel.startCollapsed }
            : {})}
          {...(panel?.eventLimit !== undefined
            ? { eventLimit: panel.eventLimit }
            : {})}
          pollMs={panel?.pollMs ?? 2000}
        />
      ) : null}
    </WebMcpTroubleshootingContext.Provider>
  );
}

export function WebMcpTroubleshootingProvider({
  children,
  actionProvider,
  querySummaries,
  trackFetchFailures = true,
  panel,
  tools = [],
  extraTools = [],
  ...providerProps
}: WebMcpTroubleshootingProviderProps) {
  const timeline = useMemo(() => new TroubleshootingTimelineBuffer(), []);
  const errors = useMemo(
    () => new ClientErrorBuffer({ includeStacks: true }),
    [],
  );
  const mountedForms = useMemo(() => createMountedFormsRegistry(), []);
  const registryRef = useRef<WebMcpRegistry | undefined>(undefined);
  const actionProviderRef = useRef(actionProvider);
  const querySummariesRef = useRef(querySummaries);
  actionProviderRef.current = actionProvider;
  querySummariesRef.current = querySummaries;

  useEffect(() => () => resetPanelVisibilityController(), []);

  const panelEnabled =
    isPanelEnabledByDefault(panel?.enabled) ||
    isPanelUrlOverrideEnabled(panel?.allowUrlOverride);

  const liveActionProvider = useMemo<ActionAvailabilityProvider>(
    () => ({
      getActionAvailability: (actionId) =>
        actionProviderRef.current?.getActionAvailability(actionId),
      listActions: () => actionProviderRef.current?.listActions?.() ?? [],
    }),
    [],
  );

  const diagnosticTools = useMemo(
    (): WebMcpToolDescriptor[] => [
      createTroubleshootingTimelineTool(timeline) as WebMcpToolDescriptor,
      createWebMcpEnvironmentTool(() =>
        createWebMcpEnvironmentSummary({ registry: registryRef.current }),
      ) as WebMcpToolDescriptor,
      createRecentClientErrorsTool(errors) as WebMcpToolDescriptor,
      createMountedFormsSummaryTool(mountedForms) as WebMcpToolDescriptor,
      createWorkflowBlockersTool({
        ...(actionProvider ? { actionProvider: liveActionProvider } : {}),
        formSummaries: () =>
          mountedForms.list().map(formSummaryFromMounted),
        declarativeFormSummaries: () => discoverDeclarativeForms(),
        recentErrors: () => errors.list(),
        querySummaries: () => querySummariesRef.current?.() ?? [],
      }) as WebMcpToolDescriptor,
      ...(actionProvider
        ? [
            createActionAvailabilityTool(liveActionProvider) as WebMcpToolDescriptor,
            createListActionsTool(liveActionProvider) as WebMcpToolDescriptor,
          ]
        : []),
      ...(tools as WebMcpToolDescriptor[]),
      ...(extraTools as WebMcpToolDescriptor[]),
    ],
    [timeline, errors, mountedForms, actionProvider, liveActionProvider, tools, extraTools],
  );

  return (
    <WebMcpProvider {...providerProps} tools={diagnosticTools}>
      <WebMcpTroubleshootingInner
        timeline={timeline}
        errors={errors}
        mountedForms={mountedForms}
        trackFetchFailures={trackFetchFailures}
        panelEnabled={panelEnabled}
        registryRef={registryRef}
        {...(actionProvider ? { actionProvider } : {})}
        {...(querySummaries ? { querySummaries } : {})}
        {...(panel ? { panel } : {})}
      >
        {children}
      </WebMcpTroubleshootingInner>
    </WebMcpProvider>
  );
}
