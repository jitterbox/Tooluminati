import {
  EnvironmentProviders,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import { createWebMcpFormTools, type WebMcpFormToolOptions } from '@tooluminati/forms';
import { registerWebMcpTools } from '@tooluminati/angular';

export function provideWebMcpFormTool<TValues>(
  options: WebMcpFormToolOptions<TValues>,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      registerWebMcpTools(createWebMcpFormTools(options), { source: 'form' });
    }),
  ]);
}

export function provideWebMcpFormTools<TValues>(
  optionsList: WebMcpFormToolOptions<TValues>[],
): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      const tools = optionsList.flatMap((options) =>
        createWebMcpFormTools(options),
      );
      registerWebMcpTools(tools, { source: 'form' });
    }),
  ]);
}

export interface SignalFormWebMcpOptions<TValues> extends WebMcpFormToolOptions<TValues> {
  getModel: () => TValues;
}

export function provideSignalFormWebMcpTool<TValues>(
  options: SignalFormWebMcpOptions<TValues>,
): EnvironmentProviders {
  return provideWebMcpFormTool({
    ...options,
    getValues: options.getValues ?? options.getModel,
  });
}
