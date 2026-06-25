import './test-setup';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import {
  provideWebMcpTroubleshooting,
  injectTroubleshootingPanel,
} from './provide-web-mcp-troubleshooting';
import { WEB_MCP_TROUBLESHOOTING } from './troubleshooting-tokens';

describe('provideWebMcpTroubleshooting', () => {
  it('registers troubleshooting services', () => {
    TestBed.configureTestingModule({
      providers: [provideWebMcpTroubleshooting({ enabled: true })],
    });
    const services = TestBed.inject(WEB_MCP_TROUBLESHOOTING);
    expect(services.timeline).toBeDefined();
    expect(services.viewModel.refresh().panelState).toBeDefined();
  });

  it('exposes injectTroubleshootingPanel snapshot', () => {
    TestBed.configureTestingModule({
      providers: [provideWebMcpTroubleshooting({ enabled: true })],
    });
    const snapshot = TestBed.runInInjectionContext(() =>
      injectTroubleshootingPanel()(),
    );
    expect(snapshot).toHaveProperty('checks');
  });
});
