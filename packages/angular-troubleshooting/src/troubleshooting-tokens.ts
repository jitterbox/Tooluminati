import { InjectionToken, type Provider } from '@angular/core';
import {
  createTroubleshootingPanelVisibilityController,
  type ClientErrorBuffer,
  type MountedFormsRegistry,
  type TroubleshootingPanelViewModel,
  type TroubleshootingPanelVisibilityController,
  type TroubleshootingTimelineBuffer,
} from '@tooluminati/diagnostics';
import type { WebMcpTroubleshootingPanelOptions } from './provide-web-mcp-troubleshooting';
import { WebMcpTroubleshootingPanelComponent } from './web-mcp-troubleshooting-panel.component';
import type { WritableSignal } from '@angular/core';
import type { TroubleshootingPanelSnapshot } from '@tooluminati/diagnostics';

export interface WebMcpTroubleshootingServices {
  timeline: TroubleshootingTimelineBuffer;
  errors: ClientErrorBuffer;
  mountedForms: MountedFormsRegistry;
  viewModel: TroubleshootingPanelViewModel;
  visibility: TroubleshootingPanelVisibilityController;
  isPanelEnabled: boolean;
  panelOptions: WebMcpTroubleshootingPanelOptions;
  panelSnapshot: WritableSignal<TroubleshootingPanelSnapshot>;
}

export const WEB_MCP_TROUBLESHOOTING =
  new InjectionToken<WebMcpTroubleshootingServices>(
    'WEB_MCP_TROUBLESHOOTING',
  );

export const WEB_MCP_PANEL_VISIBILITY =
  new InjectionToken<TroubleshootingPanelVisibilityController>(
    'WEB_MCP_PANEL_VISIBILITY',
  );

let panelVisibilityController: TroubleshootingPanelVisibilityController | undefined;

export function wireAngularPanelVisibilityController(
  controller: TroubleshootingPanelVisibilityController,
): void {
  panelVisibilityController = controller;
}

function getAngularPanelVisibilityController(): TroubleshootingPanelVisibilityController {
  if (!panelVisibilityController) {
    panelVisibilityController = createTroubleshootingPanelVisibilityController();
  }
  return panelVisibilityController;
}

export function webMcpShowTroubleshootingPanel(): void {
  getAngularPanelVisibilityController().show();
}

export function webMcpHideTroubleshootingPanel(): void {
  getAngularPanelVisibilityController().hide();
}

export function webMcpToggleTroubleshootingPanel(): void {
  getAngularPanelVisibilityController().toggle();
}

export function provideWebMcpTroubleshootingPanel(): Provider[] {
  return [WebMcpTroubleshootingPanelComponent];
}
