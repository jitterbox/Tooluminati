export interface ToolContentResult {
  content: Array<{ type: 'text'; text: string } | { type: 'json'; json: unknown }>;
  structuredContent?: unknown;
  isError?: boolean;
}

export function normalizeWebMcpResult(result: unknown): unknown {
  if (typeof result === 'string') {
    return result;
  }

  return result;
}

export function enforceOutputBudget(
  result: unknown,
  maxChars: number,
  truncate: boolean,
): unknown {
  const serialized =
    typeof result === 'string' ? result : JSON.stringify(result, null, 2);

  if (serialized.length <= maxChars) {
    return result;
  }

  if (!truncate) {
    return result;
  }

  return `${serialized.slice(0, maxChars)}...`;
}
