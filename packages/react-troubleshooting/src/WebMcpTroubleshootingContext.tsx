import { createContext, useContext } from 'react';
import type {
  ClientErrorBuffer,
  MountedFormsRegistry,
  TroubleshootingPanelViewModel,
  TroubleshootingPanelVisibilityController,
  TroubleshootingTimelineBuffer,
} from '@tooluminati/diagnostics';

export interface WebMcpTroubleshootingContextValue {
  timeline: TroubleshootingTimelineBuffer;
  errors: ClientErrorBuffer;
  mountedForms: MountedFormsRegistry;
  viewModel: TroubleshootingPanelViewModel;
  visibility: TroubleshootingPanelVisibilityController;
  isPanelEnabled: boolean;
}

export const WebMcpTroubleshootingContext =
  createContext<WebMcpTroubleshootingContextValue | null>(null);

export function useWebMcpTroubleshootingContext(): WebMcpTroubleshootingContextValue {
  const value = useContext(WebMcpTroubleshootingContext);
  if (!value) {
    throw new Error(
      'useWebMcpTroubleshootingContext requires WebMcpTroubleshootingProvider.',
    );
  }
  return value;
}
