export interface WebMcpInvocationOptions {
  /** Select explicitly for browsers that require JSON string input. Never retries execution. */
  inputFormat?: 'object' | 'json-string';
}

export interface WebMcpTestPage {
  evaluate<T, A>(callback: (arg: A) => T | Promise<T>, arg: A): Promise<T>;
}

export async function expectWebMcpTool(
  page: WebMcpTestPage,
  name: string,
): Promise<void> {
  const exists = await page.evaluate(async (toolName) => {
    const context = (document as Document & { modelContext?: unknown })
      .modelContext as
      | {
          getTools?: () => Promise<Array<{ name: string }>>;
        }
      | undefined;
    const tools = (await context?.getTools?.()) ?? [];
    return tools.some((tool) => tool.name === toolName);
  }, name);

  if (!exists) {
    throw new Error(`Expected WebMCP tool "${name}" to be registered.`);
  }
}

export async function invokeWebMcpTool<T>(
  page: WebMcpTestPage,
  name: string,
  args: unknown,
  options: WebMcpInvocationOptions = {},
): Promise<T> {
  return page.evaluate(
    async ({ toolName, input, inputFormat }) => {
      const context = (document as Document & { modelContext?: unknown })
        .modelContext as
        | {
            getTools?: () => Promise<Array<{ name: string }>>;
            executeTool?: (
              tool: unknown,
              input?: object | string,
            ) => Promise<unknown>;
          }
        | undefined;
      const tools = (await context?.getTools?.()) ?? [];
      const tool = tools.find((candidate) => candidate.name === toolName);
      if (!tool || !context?.executeTool) {
        throw new Error(`WebMCP tool "${toolName}" cannot be invoked.`);
      }

      const payload =
        input && typeof input === 'object' ? (input as object) : {};
      return context.executeTool(
        tool,
        inputFormat === 'json-string' ? JSON.stringify(payload) : payload,
      );
    },
    { toolName: name, input: args, inputFormat: options.inputFormat },
  ) as Promise<T>;
}
