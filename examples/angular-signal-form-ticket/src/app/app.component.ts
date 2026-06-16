import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WebMcpSecurityBannerComponent } from '@tooluminati/angular';
import {
  getTicketValues,
  submittedId,
  updateTicketField,
} from './diagnostics';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, WebMcpSecurityBannerComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  readonly submittedId = submittedId;

  get subject(): string {
    return getTicketValues().subject;
  }

  get message(): string {
    return getTicketValues().message;
  }

  onSubjectChange(value: string): void {
    updateTicketField('subject', value);
  }

  onMessageChange(value: string): void {
    updateTicketField('message', value);
  }
}
