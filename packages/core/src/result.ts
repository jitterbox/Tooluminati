export interface ToolContentResult {
  content: Array<
    { type: 'text'; text: string } | { type: 'json'; json: unknown }
  >;
  structuredContent?: unknown;
  isError?: boolean;
}

export interface OutputBudgetResult {
  value: unknown;
  exceeded: boolean;
  serializedLength: number;
}

export function normalizeWebMcpResult(result: unknown): unknown {
  if (typeof result === 'string') {
    return result;
  }

  return result;
}

export function applyOutputBudget(
  result: unknown,
  maxChars: number,
  truncate: boolean,
  onExceeded?: (message: string) => void,
): OutputBudgetResult {
  const serialized =
    typeof result === 'string' ? result : JSON.stringify(result, null, 2);

  if (serialized.length <= maxChars) {
    return {
      value: result,
      exceeded: false,
      serializedLength: serialized.length,
    };
  }

  onExceeded?.(
    `Output exceeds the ${maxChars} character budget (${serialized.length} chars).`,
  );

  if (!truncate) {
    return {
      value: result,
      exceeded: true,
      serializedLength: serialized.length,
    };
  }

  return {
    value: `${serialized.slice(0, maxChars)}...`,
    exceeded: true,
    serializedLength: serialized.length,
  };
}

export function enforceOutputBudget(
  result: unknown,
  maxChars: number,
  truncate: boolean,
  onExceeded?: (message: string) => void,
): unknown {
  return applyOutputBudget(result, maxChars, truncate, onExceeded).value;
}
