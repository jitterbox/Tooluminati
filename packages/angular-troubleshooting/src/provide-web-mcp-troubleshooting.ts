import {
  ApplicationRef,
  createComponent,
  DestroyRef,
  EnvironmentInjector,
  EnvironmentProviders,
  ErrorHandler,
  inject,
  Injectable,
  isDevMode,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
  signal,
  type WritableSignal,
} from '@angular/core';
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
  createTroubleshootingPanelVisibilityController,
  type ActionAvailabilityProvider,
  type QuerySummary,
  type TroubleshootingPanelSnapshot,
} from '@tooluminati/diagnostics';
import { injectWebMcpRegistry, provideWebMcpRegistry } from '@tooluminati/angular';
import {
  WEB_MCP_PANEL_VISIBILITY,
  WEB_MCP_TROUBLESHOOTING,
  wireAngularPanelVisibilityController,
  type WebMcpTroubleshootingServices,
} from './troubleshooting-tokens';
import { WebMcpTroubleshootingPanelComponent } from './web-mcp-troubleshooting-panel.component';

export interface WebMcpTroubleshootingPanelOptions {
  enabled?: boolean | 'auto';
  render?: boolean | 'auto' | boolean;
  position?: 'br' | 'bl' | 'tr' | 'tl';
  startCollapsed?: boolean;
  pollMs?: number | null;
  allowUrlOverride?: boolean;
  eventLimit?: number;
}

export interface WebMcpTroubleshootingConfig {
  enabled?: boolean;
  actionProvider?: ActionAvailabilityProvider;
  querySummaries?: () => QuerySummary[];
  trackFetchFailures?: boolean;
  panel?: WebMcpTroubleshootingPanelOptions;
  extraTools?: WebMcpToolDescriptor[];
}

function isAngularPanelEnabled(
  panel: WebMcpTroubleshootingPanelOptions | undefined,
): boolean {
  if (panel?.enabled === true) {
    return true;
  }
  if (panel?.enabled === false) {
    return false;
  }
  return (
    isPanelEnabledByDefault(panel?.enabled) ||
    isPanelUrlOverrideEnabled(panel?.allowUrlOverride) ||
    (panel?.enabled === 'auto' || panel?.enabled === undefined) && isDevMode()
  );
}

function shouldAutoRenderPanel(
  panel: WebMcpTroubleshootingPanelOptions | undefined,
  panelEnabled: boolean,
): boolean {
  return (
    panelEnabled &&
    panel?.render !== false &&
    (panel?.render === true ||
      panel?.render === 'auto' ||
      panel?.render === undefined)
  );
}

@Injectable()
export class WebMcpTroubleshootingErrorHandler implements ErrorHandler {
  private readonly services = inject(WEB_MCP_TROUBLESHOOTING);

  handleError(error: unknown): void {
    const err = error instanceof Error ? error : new Error(String(error));
    this.services.errors.push({
      message: err.message,
      source: '@angular/core ErrorHandler',
      timestamp: new Date().toISOString(),
      ...(err.stack ? { stack: err.stack } : {}),
    });
    console.error(err);
  }
}

export function provideWebMcpTroubleshooting(
  config: WebMcpTroubleshootingConfig = {},
): EnvironmentProviders {
  const timeline = new TroubleshootingTimelineBuffer();
  const errors = new ClientErrorBuffer({ includeStacks: true });
  const mountedForms = createMountedFormsRegistry();
  const visibility = createTroubleshootingPanelVisibilityController({
    ...(config.panel?.startCollapsed !== undefined
      ? { startCollapsed: config.panel.startCollapsed }
      : {}),
  });
  wireAngularPanelVisibilityController(visibility);
  const panelEnabled = isAngularPanelEnabled(config.panel);
  const registryRef: { current: WebMcpRegistry | undefined } = { current: undefined };
  const viewModel = createTroubleshootingPanelViewModel(
    {
      timeline,
      errors,
      environment: () =>
        createWebMcpEnvironmentSummary({ registry: registryRef.current }),
      ...(registryRef.current ? { registry: registryRef.current } : {}),
    },
    {
      ...(config.panel?.eventLimit !== undefined
        ? { eventLimit: config.panel.eventLimit }
        : {}),
      pollMs: config.panel?.pollMs ?? 2000,
    },
  );

  const diagnosticTools: WebMcpToolDescriptor[] = [
    createTroubleshootingTimelineTool(timeline) as WebMcpToolDescriptor,
    createWebMcpEnvironmentTool(() =>
      createWebMcpEnvironmentSummary({ registry: registryRef.current }),
    ) as WebMcpToolDescriptor,
    createRecentClientErrorsTool(errors) as WebMcpToolDescriptor,
    createMountedFormsSummaryTool(mountedForms) as WebMcpToolDescriptor,
    createWorkflowBlockersTool({
      ...(config.actionProvider ? { actionProvider: config.actionProvider } : {}),
      formSummaries: () => mountedForms.list().map(formSummaryFromMounted),
      declarativeFormSummaries: () => discoverDeclarativeForms(),
      recentErrors: () => errors.list(),
      ...(config.querySummaries ? { querySummaries: config.querySummaries } : {}),
    }) as WebMcpToolDescriptor,
    ...(config.actionProvider
      ? [
          createActionAvailabilityTool(
            config.actionProvider,
          ) as WebMcpToolDescriptor,
          createListActionsTool(config.actionProvider) as WebMcpToolDescriptor,
        ]
      : []),
    ...((config.extraTools ?? []) as WebMcpToolDescriptor[]),
  ];

  const panelSnapshot: WritableSignal<TroubleshootingPanelSnapshot> = signal(
    viewModel.refresh(),
  );

  const services: WebMcpTroubleshootingServices = {
    timeline,
    errors,
    mountedForms,
    viewModel,
    visibility,
    isPanelEnabled: panelEnabled,
    panelOptions: config.panel ?? {},
    panelSnapshot,
  };

  viewModel.subscribe(() => {
    panelSnapshot.set(viewModel.refresh());
  });
  visibility.subscribe(() => {
    panelSnapshot.set(viewModel.refresh());
  });

  const providers = [
    provideWebMcpRegistry({
      ...(config.enabled !== undefined ? { enabled: config.enabled } : {}),
      tools: diagnosticTools,
    }),
    { provide: WEB_MCP_TROUBLESHOOTING, useValue: services },
    { provide: WEB_MCP_PANEL_VISIBILITY, useValue: visibility },
    { provide: ErrorHandler, useClass: WebMcpTroubleshootingErrorHandler },
    provideEnvironmentInitializer(() => {
      registryRef.current = injectWebMcpRegistry();
      const destroyRef = inject(DestroyRef);
      const cleanups = [
        createErrorCollector({ buffer: errors }),
        createTimelineFromErrorBuffer(errors, timeline),
        createWebMcpLifecycleCollector({ buffer: timeline }),
      ];
      if (config.trackFetchFailures !== false) {
        cleanups.push(createFetchFailureTracker({ buffer: timeline }));
      }
      destroyRef.onDestroy(() => {
        for (const cleanup of cleanups) {
          cleanup();
        }
        viewModel.dispose();
      });
    }),
  ];

  if (shouldAutoRenderPanel(config.panel, panelEnabled)) {
    providers.push(
      provideEnvironmentInitializer(() => {
        const appRef = inject(ApplicationRef);
        const envInjector = inject(EnvironmentInjector);
        const host = document.createElement('div');
        document.body.appendChild(host);
        const compRef = createComponent(WebMcpTroubleshootingPanelComponent, {
          environmentInjector: envInjector,
          hostElement: host,
        });
        compRef.setInput('startCollapsed', config.panel?.startCollapsed ?? false);
        if (config.panel?.eventLimit !== undefined) {
          compRef.setInput('eventLimit', config.panel.eventLimit);
        }
        if (config.panel?.position) {
          compRef.setInput('position', config.panel.position);
        }
        appRef.attachView(compRef.hostView);
        inject(DestroyRef).onDestroy(() => {
          appRef.detachView(compRef.hostView);
          compRef.destroy();
          host.remove();
        });
      }),
    );
  }

  return makeEnvironmentProviders(providers);
}

export function injectTroubleshootingPanel() {
  return inject(WEB_MCP_TROUBLESHOOTING).panelSnapshot;
}
