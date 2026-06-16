export interface WebMcpTestPage {
  evaluate<T, A>(
    callback: (arg: A) => T | Promise<T>,
    arg: A,
  ): Promise<T>;
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
): Promise<T> {
  return page.evaluate(
    async ({ toolName, input }) => {
      const context = (document as Document & { modelContext?: unknown })
        .modelContext as
        | {
            getTools?: () => Promise<Array<{ name: string }>>;
            executeTool?: (tool: unknown, argsJson: string) => Promise<unknown>;
          }
        | undefined;
      const tools = (await context?.getTools?.()) ?? [];
      const tool = tools.find((candidate) => candidate.name === toolName);
      if (!tool || !context?.executeTool) {
        throw new Error(`WebMCP tool "${toolName}" cannot be invoked.`);
      }

      return context.executeTool(tool, JSON.stringify(input));
    },
    { toolName: name, input: args },
  ) as Promise<T>;
}
