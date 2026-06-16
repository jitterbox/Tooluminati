import { Component, computed } from '@angular/core';
import { injectWebMcpContextValue } from './inject-web-mcp-registry';
import { isWebMcpSupported } from '@tooluminati/core';

@Component({
  selector: 'web-mcp-security-banner',
  standalone: true,
  template: `
    @if (banner().enabled) {
      <aside
        aria-live="polite"
        style="
          background: #fff3cd;
          border: 1px solid #ffeeba;
          color: #856404;
          padding: 0.75rem 1rem;
          margin-bottom: 1rem;
        "
      >
        <strong>Tooluminati diagnostics enabled.</strong>
        {{ banner().message }}
        Registered tools:
        {{ banner().registeredTools.join(', ') || 'none' }}.
      </aside>
    }
  `,
})
export class WebMcpSecurityBannerComponent {
  private readonly context = injectWebMcpContextValue();

  readonly banner = computed(() => ({
    enabled: this.context.enabled,
    supported: isWebMcpSupported(),
    registeredTools: this.context.registry.getRegisteredToolNames(),
    message: this.context.enabled
      ? 'Tooluminati diagnostics are enabled for this page.'
      : 'Tooluminati diagnostics are disabled.',
  }));
}
