export interface WebMcpToolListing {
  name: string;
  description?: string | undefined;
}

type ModelContextHost = Document | Navigator;

function getModelContext(host: ModelContextHost = document):
  | {
      getTools?: () => Promise<WebMcpToolListing[]>;
      executeTool?: (
        tool: unknown,
        argsJson: string,
      ) => Promise<unknown>;
    }
  | undefined {
  return (host as ModelContextHost & { modelContext?: unknown }).modelContext as
    | {
        getTools?: () => Promise<WebMcpToolListing[]>;
        executeTool?: (
          tool: unknown,
          argsJson: string,
        ) => Promise<unknown>;
      }
    | undefined;
}

/**
 * Lists registered WebMCP tools from the browser model context.
 * Returns an empty array when WebMCP is unavailable (e.g. CI without Chrome 149).
 */
export async function listWebMcpTools(
  host: ModelContextHost = document,
): Promise<WebMcpToolListing[]> {
  const context = getModelContext(host);
  if (!context?.getTools) {
    return [];
  }

  const tools = await context.getTools();
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
  }));
}

/**
 * Executes a registered WebMCP tool by name.
 * Throws when WebMCP is unavailable or the tool cannot be resolved.
 */
export async function executeWebMcpTool(
  name: string,
  args: unknown = {},
  host: ModelContextHost = document,
): Promise<unknown> {
  const context = getModelContext(host);
  if (!context?.getTools || !context.executeTool) {
    throw new Error(
      'WebMCP model context is unavailable. Use installModelContextMock() in tests.',
    );
  }

  const tools = await context.getTools();
  const tool = tools.find((candidate) => candidate.name === name);
  if (!tool) {
    throw new Error(`WebMCP tool not found: ${name}`);
  }

  return context.executeTool(tool, JSON.stringify(args));
}
