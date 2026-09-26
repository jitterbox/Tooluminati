import { JsonPipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { WebMcpSecurityBannerComponent } from '@tooluminati/angular';
import {
  collectDisabledActionReasonsFromDom,
  type DisabledActionDomFinding,
} from '@tooluminati/testing';
import {
  CHECKOUT_ACTION_ID,
  CHECKOUT_BUTTON_LABEL,
} from './diagnostics';

interface WebMcpDiagnosis {
  actionId: string;
  available: boolean;
  reasons: string[];
}

async function diagnoseFromWebMcp(
  actionId: string,
): Promise<WebMcpDiagnosis> {
  const context = (
    document as Document & {
      modelContext?: {
        getTools: () => Promise<Array<{ name: string }>>;
        executeTool: (
          tool: unknown,
          input?: object | string,
        ) => Promise<unknown>;
      };
    }
  ).modelContext;

  if (!context?.getTools || !context.executeTool) {
    throw new Error('WebMCP is not available in this browser.');
  }

  const tools = await context.getTools();
  const tool = tools.find(
    (candidate) => candidate.name === 'why_is_action_unavailable',
  );
  if (!tool) {
    throw new Error('why_is_action_unavailable is not registered.');
  }

  const result = (await context.executeTool(tool, {
    actionId,
  })) as WebMcpDiagnosis;

  return {
    actionId: result.actionId,
    available: result.available,
    reasons: result.reasons ?? [],
  };
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [JsonPipe, WebMcpSecurityBannerComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  private readonly cdr = inject(ChangeDetectorRef);

  readonly checkoutActionId = CHECKOUT_ACTION_ID;
  readonly checkoutButtonLabel = CHECKOUT_BUTTON_LABEL;

  domResult: DisabledActionDomFinding | null = null;
  webMcpResult: WebMcpDiagnosis | null = null;
  error: string | null = null;

  get domBlockers(): number {
    return this.domResult?.visibleBlockerReasons.length ?? 0;
  }

  get webMcpBlockers(): number {
    return this.webMcpResult?.reasons.length ?? 0;
  }

  get webMcpStrictlyBetter(): boolean {
    return this.domBlockers === 0 && this.webMcpBlockers > 0;
  }

  runDomDiagnosis(): void {
    this.error = null;
    this.domResult = collectDisabledActionReasonsFromDom(
      document,
      CHECKOUT_BUTTON_LABEL,
    );
  }

  async runWebMcpDiagnosis(): Promise<void> {
    this.error = null;
    try {
      this.webMcpResult = await diagnoseFromWebMcp(CHECKOUT_ACTION_ID);
    } catch (nextError) {
      this.webMcpResult = null;
      this.error =
        nextError instanceof Error ? nextError.message : 'WebMCP failed.';
    } finally {
      this.cdr.detectChanges();
    }
  }
}
