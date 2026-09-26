import { Directive, input } from '@angular/core';

export {
  isAgentInvokedSubmit,
  respondWithAgentResult,
  WEBMCP_DECLARATIVE_FOCUS_STYLES,
  ensureDeclarativeFocusStyles,
} from '@tooluminati/diagnostics';

@Directive({
  selector: 'form[webMcpForm]',
  standalone: true,
  host: {
    '[attr.toolname]': 'toolName()',
    '[attr.tooldescription]': 'toolDescription()',
    '[attr.toolautosubmit]': 'autoSubmit() ? "" : null',
  },
})
export class WebMcpFormDirective {
  readonly toolName = input.required<string>({ alias: 'webMcpForm' });
  readonly toolDescription = input.required<string>();
  readonly autoSubmit = input(false, { alias: 'webMcpAutoSubmit' });
}

@Directive({
  selector: '[webMcpParamDescription]',
  standalone: true,
  host: {
    '[attr.toolparamdescription]': 'webMcpParamDescription()',
  },
})
export class WebMcpParamDescriptionDirective {
  readonly webMcpParamDescription = input.required<string>();
}
