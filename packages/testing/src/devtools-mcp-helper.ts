import type { WebMcpInvocationOptions } from './browser-helpers';
import type { BrowserRegisteredTool } from '@tooluminati/core';

export interface WebMcpToolListing {
  name: string;
  description?: string | undefined;
}

type ModelContextHost = Document | Navigator;

function getModelContext(host: ModelContextHost = document):
  | {
      getTools?: (options?: {
        fromOrigins?: string[];
      }) => Promise<BrowserRegisteredTool[]>;
      executeTool?: (
        tool: unknown,
        input?: object | string,
        options?: { signal?: AbortSignal },
      ) => Promise<unknown>;
    }
  | undefined {
  return (host as ModelContextHost & { modelContext?: unknown })
    .modelContext as
    | {
        getTools?: (options?: {
          fromOrigins?: string[];
        }) => Promise<BrowserRegisteredTool[]>;
        executeTool?: (
          tool: unknown,
          input?: object | string,
          options?: { signal?: AbortSignal },
        ) => Promise<unknown>;
      }
    | undefined;
}

/**
 * Lists registered WebMCP tools from the browser model context.
 * Returns an empty array when WebMCP is unavailable.
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
 * Uses object input by default; legacy JSON string input must be explicitly selected.
 */
export async function executeWebMcpTool(
  name: string,
  args: unknown = {},
  host: ModelContextHost = document,
  options: WebMcpInvocationOptions = {},
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

  const payload = args && typeof args === 'object' ? (args as object) : {};
  return context.executeTool(
    tool,
    options.inputFormat === 'json-string' ? JSON.stringify(payload) : payload,
  );
}
