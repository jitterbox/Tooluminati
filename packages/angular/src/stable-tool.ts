import { computed, type Signal } from '@angular/core';
import type { WebMcpToolDescriptor } from '@tooluminati/core';

export function createStableWebMcpTool<TArgs, TResult>(
  factory: () => WebMcpToolDescriptor<TArgs, TResult>,
  deps: Signal<unknown>[],
): Signal<WebMcpToolDescriptor<TArgs, TResult>> {
  return computed(() => {
    for (const dep of deps) {
      dep();
    }

    return factory();
  });
}
