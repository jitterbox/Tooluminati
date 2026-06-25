export interface ToolSchemaSnapshot {
  name: string;
  description: string;
  inputSchema?: unknown;
  annotations?: Record<string, unknown> | undefined;
  source?: string;
}

export interface ToolCallEvalCase {
  prompt: string;
  expectedTool: string;
  args?: Record<string, unknown>;
}

export interface ToolCallEvalFixture {
  tools: ToolSchemaSnapshot[];
  cases: ToolCallEvalCase[];
}

const BUDGETS = {
  name: 30,
  paramName: 30,
  paramDescription: 150,
  description: 500,
  output: 1500,
};

function walkSchemaProperties(
  schema: unknown,
  visit: (name: string, node: Record<string, unknown>) => void,
): void {
  if (!schema || typeof schema !== 'object') {
    return;
  }
  const node = schema as Record<string, unknown>;
  const properties = node.properties;
  if (properties && typeof properties === 'object') {
    for (const [name, child] of Object.entries(properties)) {
      if (child && typeof child === 'object') {
        visit(name, child as Record<string, unknown>);
      }
    }
  }
}

export async function snapshotRegisteredTools(
  page: { evaluate: <T>(fn: () => T) => Promise<T> },
): Promise<ToolSchemaSnapshot[]> {
  return page.evaluate(() => {
    const context = (
      document as Document & {
        modelContext?: {
          getTools: () => Promise<Array<Record<string, unknown>>>;
        };
      }
    ).modelContext;
    if (!context?.getTools) {
      return [];
    }
    return context.getTools().then((tools) =>
      tools.map((tool) => ({
        name: String(tool.name ?? ''),
        description: String(tool.description ?? ''),
        inputSchema: tool.inputSchema,
        ...(tool.annotations
          ? { annotations: tool.annotations as Record<string, unknown> }
          : {}),
      })),
    );
  });
}

export function createToolCallEvalFixture(
  tools: ToolSchemaSnapshot[],
  cases: ToolCallEvalCase[],
): ToolCallEvalFixture {
  return { tools, cases };
}

export function assertToolSchemaBudgets(tools: ToolSchemaSnapshot[]): string[] {
  const violations: string[] = [];
  for (const tool of tools) {
    if (tool.name.length > BUDGETS.name) {
      violations.push(`Tool name too long: ${tool.name}`);
    }
    if (tool.description.length > BUDGETS.description) {
      violations.push(`Description too long: ${tool.name}`);
    }
    walkSchemaProperties(tool.inputSchema, (name, node) => {
      if (name.length > BUDGETS.paramName) {
        violations.push(`Param name too long on ${tool.name}: ${name}`);
      }
      const description = node.description;
      if (
        typeof description === 'string' &&
        description.length > BUDGETS.paramDescription
      ) {
        violations.push(`Param description too long on ${tool.name}.${name}`);
      }
    });
  }
  return violations;
}

/** Lightweight fixture helper; does not invoke a model or browser agent. */
export function runToolSelectionSmokeTest(
  tools: ToolSchemaSnapshot[],
  prompt: string,
  expected: string,
): boolean {
  const haystack = `${prompt} ${tools.map((t) => t.description).join(' ')}`.toLowerCase();
  return (
    haystack.includes(expected.toLowerCase()) ||
    tools.some((t) => t.name === expected)
  );
}

export async function runTimelineComparativeProof(
  page: Parameters<typeof import('./comparative-proof').runComparativeProof>[0],
  options: {
    buttonLabel: string;
    actionId: string;
    timelineTool?: string;
  },
): Promise<{ domBlockerCount: number; timelineEventCount: number }> {
  const { runComparativeProof } = await import('./comparative-proof');
  const { invokeWebMcpTool } = await import('./browser-helpers');
  const proof = await runComparativeProof(page, {
    buttonLabel: options.buttonLabel,
    actionId: options.actionId,
  });
  const timeline = await invokeWebMcpTool<{ events: unknown[] }>(
    page,
    options.timelineTool ?? 'get_troubleshooting_timeline',
    {},
  );
  return {
    domBlockerCount: proof.domBlockerCount,
    timelineEventCount: timeline.events?.length ?? 0,
  };
}
