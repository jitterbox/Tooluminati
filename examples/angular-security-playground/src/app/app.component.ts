import { Component, computed } from '@angular/core';
import {
  injectWebMcpRegistry,
  WebMcpSecurityBannerComponent,
} from '@tooluminati/angular';
import { demoTools, describeToolRisk } from './diagnostics';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WebMcpSecurityBannerComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  private readonly registry = injectWebMcpRegistry();

  readonly toolEntries = computed(() => {
    const registered = new Set(this.registry.getRegisteredToolNames());

    return demoTools.map((tool) => ({
      ...describeToolRisk(tool),
      registered: registered.has(tool.name),
    }));
  });
}
