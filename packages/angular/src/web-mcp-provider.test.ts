/// <reference types="vitest/globals" />
import './test-setup';
import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { WebMcpSecurityPolicyError } from '@tooluminati/core';
import { ciStrictPolicy } from '@tooluminati/policies';
import { MockModelContext } from '@tooluminati/testing';
import { provideWebMcpRegistry } from './provide-web-mcp-registry';
import { registerWebMcpTool } from './register-web-mcp-tool';
import { webMcpSecurityBanner } from './web-mcp-security-banner';
import { WEB_MCP_CONTEXT } from './web-mcp-context';

@Component({
  selector: 'tool-component',
  standalone: true,
  template: '',
})
class ToolComponent {
  private readonly valueState = { value: 'first' };

  constructor() {
    registerWebMcpTool(
      () => ({
        name: 'get_value',
        description: 'Returns latest Angular value.',
        annotations: { readOnlyHint: true },
        execute: () => ({ value: this.valueState.value }),
      }),
      {},
    );
  }

  updateValue(value: string): void {
    this.valueState.value = value;
  }
}

@Component({
  selector: 'write-tool-component',
  standalone: true,
  template: '',
})
class WriteToolComponent {
  constructor() {
    registerWebMcpTool(
      () => ({
        name: 'save_item',
        description: 'Save item.',
        annotations: { readOnlyHint: false },
        execute: () => ({ ok: true }),
      }),
      {},
    );
  }
}

@Component({
  selector: 'registry-host',
  standalone: true,
  template: '',
})
class RegistryHostComponent {
  constructor() {
    inject(WEB_MCP_CONTEXT);
  }
}

describe('@tooluminati/angular WebMcp registry', () => {
  it('registers hook tools and unregisters on destroy', async () => {
    const modelContext = new MockModelContext();

    TestBed.configureTestingModule({
      imports: [ToolComponent],
      providers: [
        provideWebMcpRegistry({ enabled: true, modelContext }),
      ],
    });

    const fixture = TestBed.createComponent(ToolComponent);
    fixture.detectChanges();

    await vi.waitFor(() => {
      expect(modelContext.tools.has('get_value')).toBe(true);
    });

    fixture.destroy();
    expect(modelContext.tools.has('get_value')).toBe(false);
  });

  it('executes with fresh state after update', async () => {
    const modelContext = new MockModelContext();

    TestBed.configureTestingModule({
      imports: [ToolComponent],
      providers: [
        provideWebMcpRegistry({ enabled: true, modelContext }),
      ],
    });

    const fixture = TestBed.createComponent(ToolComponent);
    fixture.detectChanges();
    fixture.componentInstance.updateValue('second');
    fixture.detectChanges();

    const result = await modelContext.executeTool('get_value', {});
    expect(result).toEqual({ value: 'second' });
  });

  it('registers provider tools and cleans them up', async () => {
    const modelContext = new MockModelContext();
    const tools = [
      {
        name: 'provider_tool',
        description: 'Provider tool.',
        execute: () => ({ ok: true }),
      },
    ];

    TestBed.configureTestingModule({
      imports: [RegistryHostComponent],
      providers: [
        provideWebMcpRegistry({
          enabled: true,
          modelContext,
          tools,
        }),
      ],
    });

    const fixture = TestBed.createComponent(RegistryHostComponent);
    fixture.detectChanges();

    await vi.waitFor(() => {
      expect(modelContext.tools.has('provider_tool')).toBe(true);
    });

    fixture.destroy();
    TestBed.resetTestingModule();
    expect(modelContext.tools.has('provider_tool')).toBe(false);
  });

  it('throws in strict mode when write tool lacks confirmation', () => {
    const modelContext = new MockModelContext();
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    expect(() => {
      TestBed.configureTestingModule({
        imports: [WriteToolComponent],
        providers: [
          provideWebMcpRegistry({
            enabled: true,
            strict: true,
            modelContext,
            policies: ciStrictPolicy,
          }),
        ],
      });
      TestBed.createComponent(WriteToolComponent).detectChanges();
    }).toThrow(WebMcpSecurityPolicyError);

    expect(modelContext.tools.has('save_item')).toBe(false);
    consoleError.mockRestore();
  });

  it('returns security banner state', () => {
    const modelContext = new MockModelContext();

    @Component({
      selector: 'banner-host',
      standalone: true,
      template: '',
    })
    class BannerHostComponent {
      readonly banner = webMcpSecurityBanner();
    }

    TestBed.configureTestingModule({
      imports: [BannerHostComponent],
      providers: [
        provideWebMcpRegistry({ enabled: true, modelContext }),
      ],
    });

    const fixture = TestBed.createComponent(BannerHostComponent);
    fixture.detectChanges();
    const banner = fixture.componentInstance.banner();

    expect(banner.enabled).toBe(true);
    expect(banner.message).toContain('enabled');
    expect(Array.isArray(banner.registeredTools)).toBe(true);
  });
});
