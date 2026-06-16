import { Component } from '@angular/core';
import { WebMcpSecurityBannerComponent } from '@tooluminati/angular';
import { pathname, routes, setPathname } from './diagnostics';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WebMcpSecurityBannerComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  readonly pathname = pathname;
  readonly routes = routes;

  navigate(path: string): void {
    setPathname(path);
  }
}
