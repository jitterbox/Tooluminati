export const MODEL_CONTEXT_MOCK_INIT_SCRIPT = `
(() => {
  const tools = new Map();

  function parseInput(input) {
    if (typeof input === 'string') {
      return JSON.parse(input || '{}');
    }
    return input ?? {};
  }

  Object.defineProperty(document, 'modelContext', {
    configurable: true,
    value: {
      registerTool(tool, options = {}) {
        if (options.signal?.aborted) {
          return;
        }

        tools.set(tool.name, tool);
        options.signal?.addEventListener(
          'abort',
          () => {
            tools.delete(tool.name);
          },
          { once: true },
        );
      },
      async getTools() {
        return [...tools.values()];
      },
      async executeTool(toolOrName, input = {}, options = {}) {
        const name =
          typeof toolOrName === 'string'
            ? toolOrName
            : toolOrName?.name;
        const tool = name ? tools.get(name) : undefined;
        if (!tool) {
          throw new Error('Tool not found: ' + name);
        }

        return tool.execute(parseInput(input), {
          signal: options.signal ?? new AbortController().signal,
        });
      },
    },
  });
})();
`;
