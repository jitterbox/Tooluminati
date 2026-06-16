import { invokeWebMcpTool } from './browser-helpers';
import {
  inspectDisabledActionFromDom,
  type DisabledActionDomFinding,
} from './dom-only-inspection';

export interface WebMcpActionDiagnosis {
  actionId: string;
  available: boolean;
  reasons: string[];
}

export interface ComparativeProofResult {
  domOnly: DisabledActionDomFinding;
  webMcp: WebMcpActionDiagnosis;
  domBlockerCount: number;
  webMcpBlockerCount: number;
  webMcpIsStrictlyMoreInformative: boolean;
}

export async function diagnoseCheckoutBlockerFromDomOnly(
  page: Parameters<typeof inspectDisabledActionFromDom>[0],
  buttonLabel: string,
): Promise<DisabledActionDomFinding> {
  return inspectDisabledActionFromDom(page, buttonLabel);
}

export async function diagnoseCheckoutBlockerFromWebMcp(
  page: Parameters<typeof invokeWebMcpTool>[0],
  actionId: string,
  toolName = 'why_is_action_unavailable',
): Promise<WebMcpActionDiagnosis> {
  const result = await invokeWebMcpTool<{
    actionId: string;
    available: boolean;
    reasons: string[];
  }>(page, toolName, { actionId });

  return {
    actionId: result.actionId,
    available: result.available,
    reasons: result.reasons ?? [],
  };
}

export async function runComparativeProof(
  page: Parameters<typeof inspectDisabledActionFromDom>[0],
  options: {
    buttonLabel: string;
    actionId: string;
    toolName?: string;
  },
): Promise<ComparativeProofResult> {
  const domOnly = await diagnoseCheckoutBlockerFromDomOnly(
    page,
    options.buttonLabel,
  );
  const webMcp = await diagnoseCheckoutBlockerFromWebMcp(
    page,
    options.actionId,
    options.toolName,
  );

  const domBlockerCount = domOnly.visibleBlockerReasons.length;
  const webMcpBlockerCount = webMcp.reasons.length;

  return {
    domOnly,
    webMcp,
    domBlockerCount,
    webMcpBlockerCount,
    webMcpIsStrictlyMoreInformative:
      domOnly.disabled &&
      domBlockerCount === 0 &&
      webMcpBlockerCount > 0 &&
      !webMcp.available,
  };
}
