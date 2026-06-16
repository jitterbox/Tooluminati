import { Component } from '@angular/core';
import { webMcpComponentCatalog } from '@tooluminati/devtools';
import { webMcpRegisteredTools } from './use-registered-tools';

@Component({
  selector: 'web-mcp-debug-panel',
  standalone: true,
  template: `
    <section
      aria-label="WebMCP debug panel"
      style="
        border: 1px solid #ddd;
        border-radius: 4px;
        margin-top: 1rem;
        padding: 0.75rem 1rem;
        font-family: monospace;
        font-size: 0.875rem;
      "
    >
      <h2 style="margin: 0 0 0.5rem; font-size: 1rem">WebMCP Debug Panel</h2>
      @if (tools().length === 0) {
        <p style="margin: 0">No tools registered.</p>
      } @else {
        <ul style="margin: 0; padding-left: 1.25rem">
          @for (tool of tools(); track tool.name) {
            <li>
              <strong>{{ tool.name }}</strong>
              @if (tool.annotations?.readOnlyHint === true) {
                (read-only)
              }
              — {{ tool.description }}
            </li>
          }
        </ul>
      }
      @if (catalog.length > 0) {
        <p style="margin: 0.75rem 0 0">
          Catalog entries: {{ catalog.length }}
        </p>
      }
    </section>
  `,
})
export class WebMcpDebugPanelComponent {
  readonly tools = webMcpRegisteredTools();
  readonly catalog = webMcpComponentCatalog;
}
