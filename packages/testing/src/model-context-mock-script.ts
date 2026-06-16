export const MODEL_CONTEXT_MOCK_INIT_SCRIPT = `
(() => {
  const tools = new Map();

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
      async executeTool(toolOrName, argsJson = '{}') {
        const name =
          typeof toolOrName === 'string'
            ? toolOrName
            : toolOrName?.name;
        const tool = name ? tools.get(name) : undefined;
        if (!tool) {
          throw new Error('Tool not found: ' + name);
        }

        return tool.execute(JSON.parse(argsJson));
      },
    },
  });
})();
`;
