import { useEffect, useState } from 'react';
import {
  serializeTroubleshootingDiagnostics,
  type TroubleshootingPanelSnapshot,
} from '@tooluminati/diagnostics';
import { useWebMcpTroubleshootingContext } from './WebMcpTroubleshootingContext';

export function useTroubleshootingPanel() {
  const { viewModel } = useWebMcpTroubleshootingContext();
  const [snapshot, setSnapshot] = useState<TroubleshootingPanelSnapshot>(() =>
    viewModel.refresh(),
  );

  useEffect(() => {
    const refresh = () => setSnapshot(viewModel.refresh());
    refresh();
    return viewModel.subscribe(refresh);
  }, [viewModel]);

  return {
    snapshot,
    panelState: snapshot.panelState,
    refresh: () => setSnapshot(viewModel.refresh()),
    copyDiagnostics: () => serializeTroubleshootingDiagnostics(snapshot),
  };
}

export function useTroubleshootingPanelVisibility() {
  const { visibility, isPanelEnabled } = useWebMcpTroubleshootingContext();
  const [, bump] = useState(0);

  useEffect(() => visibility.subscribe(() => bump((n) => n + 1)), [visibility]);

  return {
    visibility,
    isPanelEnabled,
    visible: visibility.visible,
    collapsed: visibility.collapsed,
  };
}
