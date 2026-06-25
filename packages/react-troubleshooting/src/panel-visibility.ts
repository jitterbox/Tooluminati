import {
  createTroubleshootingPanelVisibilityController,
  type TroubleshootingPanelVisibilityController,
} from '@tooluminati/diagnostics';

let controller: TroubleshootingPanelVisibilityController | undefined;

export function getPanelVisibilityController(): TroubleshootingPanelVisibilityController {
  if (!controller) {
    controller = createTroubleshootingPanelVisibilityController();
  }
  return controller;
}

export function wirePanelVisibilityController(
  next: TroubleshootingPanelVisibilityController,
): void {
  controller = next;
}

export function showWebMcpTroubleshootingPanel(): void {
  getPanelVisibilityController().show();
}

export function hideWebMcpTroubleshootingPanel(): void {
  getPanelVisibilityController().hide();
}

export function toggleWebMcpTroubleshootingPanel(): void {
  getPanelVisibilityController().toggle();
}

export function resetPanelVisibilityController(): void {
  controller = undefined;
}
