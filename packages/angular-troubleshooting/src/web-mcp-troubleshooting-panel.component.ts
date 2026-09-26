import {
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  input,
  signal,
  type OnDestroy,
  type OnInit,
} from '@angular/core';
import {
  filterPanelEvents,
  serializeTroubleshootingDiagnostics,
  ensureDeclarativeFocusStyles,
  type TimelineFilterGroup,
  type TroubleshootingPanelSnapshot,
} from '@tooluminati/diagnostics';
import { WEB_MCP_TROUBLESHOOTING } from './troubleshooting-tokens';

@Component({
  selector: 'webmcp-troubleshooting-panel',
  standalone: true,
  host: {
    '[style.position]': '"fixed"',
    '[style.z-index]': '"99990"',
    '[style.right.px]': 'position() === "br" || position() === "tr" ? 26 : null',
    '[style.left.px]': 'position() === "bl" || position() === "tl" ? 26 : null',
    '[style.bottom.px]': 'position() === "br" || position() === "bl" ? 26 : null',
    '[style.top.px]': 'position() === "tr" || position() === "tl" ? 26 : null',
  },
  template: `
    @if (services.isPanelEnabled && services.visibility.visible) {
      @if (services.visibility.collapsed) {
        <button
          type="button"
          class="tlm-badge"
          data-testid="webmcp-troubleshooting-badge"
          (click)="services.visibility.setCollapsed(false)"
        >
          WebMCP · {{ snapshot().toolCount }} tools
        </button>
      } @else {
        <section
          class="tlm-panel"
          data-testid="webmcp-troubleshooting-panel"
          [attr.data-state]="snapshot().panelState"
        >
          <header class="tlm-header">
            <strong>WebMCP Troubleshooting</strong>
            <button type="button" (click)="refresh()">Refresh</button>
            <button type="button" (click)="copy()">Copy JSON</button>
            <button type="button" (click)="services.visibility.setCollapsed(true)">–</button>
          </header>
          <div class="tlm-stats">
            <span>{{ snapshot().supported ? 'Supported' : 'Unsupported' }}</span>
            <span>{{ snapshot().toolCount }} tools</span>
            <span>{{ snapshot().issueCount }} issues</span>
          </div>
          @if (snapshot().warnings.length) {
            <div class="tlm-section">
              <h3>Warnings</h3>
              @for (warning of snapshot().warnings; track warning) {
                <div class="tlm-row">{{ warning }}</div>
              }
            </div>
          }
          <div class="tlm-section">
            <h3>Environment</h3>
            @for (check of snapshot().checks; track check.id) {
              <div class="tlm-row">{{ check.label }} · {{ check.value }}</div>
            }
          </div>
          <div class="tlm-section">
            <h3>Timeline</h3>
            @for (chip of chips; track chip) {
              <button type="button" (click)="filter.set(chip)">{{ chip }}</button>
            }
            @for (event of filteredEvents(); track event.id) {
              <div class="tlm-row">{{ event.title }} · {{ event.time }}</div>
            }
          </div>
          <div class="tlm-section">
            <h3>Client Errors</h3>
            @for (error of snapshot().errors; track error.id) {
              <div class="tlm-row">{{ error.message }}</div>
            }
          </div>
        </section>
      }
    }
  `,
  styles: [
    `
      .tlm-badge,
      .tlm-panel {
        font-family: 'IBM Plex Sans', system-ui, sans-serif;
      }
      .tlm-panel {
        width: 412px;
        max-height: calc(100vh - 52px);
        overflow: auto;
        background: #0a0e1a;
        color: #eef2fa;
        border: 1px solid #1c2438;
        border-radius: 15px;
        padding: 12px;
      }
      .tlm-header {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .tlm-stats,
      .tlm-section {
        margin-top: 10px;
      }
      .tlm-row {
        font-size: 12px;
        padding: 4px 0;
      }
    `,
  ],
})
export class WebMcpTroubleshootingPanelComponent implements OnInit, OnDestroy {
  readonly services = inject(WEB_MCP_TROUBLESHOOTING);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly position = input<'br' | 'bl' | 'tr' | 'tl'>('br');
  readonly startCollapsed = input(false);
  readonly eventLimit = input(20);
  readonly filter = signal<TimelineFilterGroup>('all');
  readonly chips = ['all', 'failures', 'blocked', 'tools', 'nav'] as const;
  private unsubVm?: () => void;
  private unsubVis?: () => void;
  readonly snapshot = signal<TroubleshootingPanelSnapshot>(
    this.services.viewModel.refresh(),
  );
  readonly filteredEvents = computed(() =>
    filterPanelEvents(this.snapshot().events, this.filter()),
  );

  ngOnInit(): void {
    ensureDeclarativeFocusStyles();
    if (this.startCollapsed()) {
      this.services.visibility.setCollapsed(true);
    }
    this.unsubVm = this.services.viewModel.subscribe(() => {
      this.snapshot.set(this.services.viewModel.refresh());
      this.cdr.markForCheck();
    });
    this.unsubVis = this.services.visibility.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.unsubVm?.();
    this.unsubVis?.();
  }

  refresh(): void {
    this.snapshot.set(this.services.viewModel.refresh());
  }

  copy(): void {
    const json = serializeTroubleshootingDiagnostics(this.snapshot());
    void navigator.clipboard?.writeText(json);
  }
}
