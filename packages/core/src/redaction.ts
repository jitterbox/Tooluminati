export interface RedactObjectOptions {
  keys?: Array<string | RegExp>;
  maxDepth?: number;
  maxArrayLength?: number;
  maxStringLength?: number;
  replacement?: string;
}

const DEFAULT_KEYS = [
  /token/i,
  /secret/i,
  /password/i,
  /cookie/i,
  /authorization/i,
  /ssn/i,
  /credit.*card/i,
  /email/i,
];

export function redactObject(
  value: unknown,
  options: RedactObjectOptions = {},
): unknown {
  const seen = new WeakSet<object>();
  const keys = options.keys ?? DEFAULT_KEYS;
  const replacement = options.replacement ?? '[REDACTED]';
  const maxDepth = options.maxDepth ?? 4;
  const maxArrayLength = options.maxArrayLength ?? 20;
  const maxStringLength = options.maxStringLength ?? 300;

  const shouldRedactKey = (key: string) =>
    keys.some((candidate) =>
      typeof candidate === 'string'
        ? candidate.toLowerCase() === key.toLowerCase()
        : candidate.test(key),
    );

  const visit = (current: unknown, depth: number, key?: string): unknown => {
    if (key && shouldRedactKey(key)) {
      return replacement;
    }

    if (typeof current === 'string') {
      return current.length > maxStringLength
        ? `${current.slice(0, maxStringLength)}...`
        : current;
    }

    if (current === null || typeof current !== 'object') {
      return current;
    }

    if (depth >= maxDepth) {
      return '[MaxDepth]';
    }

    if (seen.has(current)) {
      return '[Circular]';
    }
    seen.add(current);

    if (Array.isArray(current)) {
      return current
        .slice(0, maxArrayLength)
        .map((item) => visit(item, depth + 1));
    }

    return Object.fromEntries(
      Object.entries(current).map(([childKey, childValue]) => [
        childKey,
        visit(childValue, depth + 1, childKey),
      ]),
    );
  };

  return visit(value, 0);
}
