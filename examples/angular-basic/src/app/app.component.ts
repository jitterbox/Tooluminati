import { Component } from '@angular/core';
import { WebMcpSecurityBannerComponent } from '@tooluminati/angular';
import { profileDirty, markProfileDirty } from './diagnostics';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WebMcpSecurityBannerComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  readonly pageTitle = 'Tooluminati';
  readonly dirty = profileDirty;

  makeDirty(): void {
    markProfileDirty();
  }
}
