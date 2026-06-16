import {
  Component,
  DestroyRef,
  effect,
  inject,
  input,
} from '@angular/core';
import type {
  WebMcpToolDescriptor,
  WebMcpToolSource,
} from '@tooluminati/core';
import { injectWebMcpRegistry } from './inject-web-mcp-registry';

@Component({
  selector: 'web-mcp-scope',
  standalone: true,
  template: '<ng-content />',
})
export class WebMcpScopeComponent {
  readonly tools = input.required<WebMcpToolDescriptor[]>();
  readonly source = input<WebMcpToolSource>('scope');
  readonly namespaceSegment = input<string | undefined>(undefined);

  constructor() {
    const registry = injectWebMcpRegistry();
    const destroyRef = inject(DestroyRef);

    effect((onCleanup) => {
      const segment = this.namespaceSegment();
      const scopedTools = segment
        ? this.tools().map((tool) => ({
            ...tool,
            name: `${segment}.${tool.name}`,
          }))
        : this.tools();

      const registrations = scopedTools.map((tool) =>
        registry.registerTool(tool, {
          source: this.source(),
        }),
      );

      onCleanup(() => {
        for (const registration of registrations) {
          registration.abort();
        }
      });
    });

    destroyRef.onDestroy(() => undefined);
  }
}
