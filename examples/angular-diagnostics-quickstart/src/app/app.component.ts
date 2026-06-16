import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { WebMcpSecurityBannerComponent } from '@tooluminati/angular';
import {
  acceptedTerms,
  getRedactedAppInfo,
  setAcceptedTerms,
} from './diagnostics';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [JsonPipe, WebMcpSecurityBannerComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  readonly acceptedTerms = acceptedTerms;
  displayInfo: unknown = null;

  onTermsChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    setAcceptedTerms(target.checked);
  }

  showRedactedInfo(): void {
    this.displayInfo = getRedactedAppInfo();
  }
}
