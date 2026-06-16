import { useMemo, type DependencyList } from 'react';
import type { WebMcpToolDescriptor } from '@tooluminati/core';
import { useWebMcpTools } from '@tooluminati/react';
import { createWebMcpFormTools } from './create-form-tools';
import { inferSchemaFromValue } from './infer-schema';
import type { WebMcpFormToolOptions } from './types';

export { createFormValidationSummaryTool } from './create-form-tools';

export function useWebMcpFormTool<TValues>(
  options: WebMcpFormToolOptions<TValues>,
  deps: DependencyList = [],
): void {
  const schema = useMemo(
    () => options.schema ?? inferSchemaFromValue(options.getValues()),
    [options],
  );

  if (!schema) {
    throw new Error(
      `Could not infer WebMCP schema for form "${options.name}". ` +
        'Provide an explicit schema or use concrete non-null defaults.',
    );
  }

  const tools = useMemo(
    (): WebMcpToolDescriptor[] => createWebMcpFormTools(options),
    [options],
  );

  useWebMcpTools(tools, deps, { source: 'form' });
}
