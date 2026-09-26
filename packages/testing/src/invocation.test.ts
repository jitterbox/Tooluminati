import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  expectWebMcpTool,
  invokeWebMcpTool,
  type WebMcpTestPage,
  type WebMcpInvocationOptions,
} from './browser-helpers';
import { executeWebMcpTool, listWebMcpTools } from './devtools-mcp-helper';

const page: WebMcpTestPage = {
  evaluate: async (callback, arg) => callback(arg),
};
const original = Object.getOwnPropertyDescriptor(document, 'modelContext');
afterEach(() => {
  if (original) Object.defineProperty(document, 'modelContext', original);
  else Reflect.deleteProperty(document, 'modelContext');
});
function install(context: unknown) {
  Object.defineProperty(document, 'modelContext', {
    configurable: true,
    value: context,
  });
}
const tool = { name: 'write_item', description: 'Writes an item.' };
const callers = [
  [
    'DevTools',
    (args: unknown, options?: WebMcpInvocationOptions) =>
      executeWebMcpTool(tool.name, args, document, options),
  ],
  [
    'Playwright',
    (args: unknown, options?: WebMcpInvocationOptions) =>
      invokeWebMcpTool(page, tool.name, args, options),
  ],
] as const;
for (const [label, invoke] of callers) {
  describe(label, () => {
    it('passes the discovered descriptor and object exactly once', async () => {
      const executeTool = vi.fn().mockResolvedValue({ saved: true });
      install({ getTools: async () => [tool], executeTool });
      await expect(invoke({ id: 3 })).resolves.toEqual({ saved: true });
      expect(executeTool).toHaveBeenCalledExactlyOnceWith(tool, { id: 3 });
    });
    it('selects legacy string encoding before executing', async () => {
      const executeTool = vi.fn().mockResolvedValue('saved');
      install({ getTools: async () => [tool], executeTool });
      await expect(
        invoke({ id: 3 }, { inputFormat: 'json-string' }),
      ).resolves.toBe('saved');
      expect(executeTool).toHaveBeenCalledExactlyOnceWith(tool, '{"id":3}');
    });
    it.each([
      new TypeError('handler failed after write'),
      new Error('failed'),
      new DOMException('cancelled', 'AbortError'),
    ])('never retries a failed execution (%s)', async (error) => {
      const executeTool = vi.fn().mockRejectedValue(error);
      install({ getTools: async () => [tool], executeTool });
      await expect(invoke({})).rejects.toBe(error);
      expect(executeTool).toHaveBeenCalledTimes(1);
    });
    it('propagates legacy failures without retrying', async () => {
      const error = new TypeError('legacy failure');
      const executeTool = vi.fn().mockRejectedValue(error);
      install({ getTools: async () => [tool], executeTool });
      await expect(invoke({}, { inputFormat: 'json-string' })).rejects.toBe(
        error,
      );
      expect(executeTool).toHaveBeenCalledTimes(1);
    });
    it.each([undefined, null, 5, 'text'])(
      'normalizes non-object input %s to empty input',
      async (input) => {
        const executeTool = vi.fn();
        install({ getTools: async () => [tool], executeTool });
        await invoke(input);
        expect(executeTool).toHaveBeenCalledExactlyOnceWith(tool, {});
      },
    );
    it.each([undefined, {}, { getTools: async () => [] }])(
      'rejects unavailable tools or APIs',
      async (context) => {
        install(context);
        await expect(invoke({})).rejects.toThrow();
      },
    );
    it('never invokes a missing tool', async () => {
      const executeTool = vi.fn();
      install({ getTools: async () => [], executeTool });
      await expect(invoke({})).rejects.toThrow();
      expect(executeTool).not.toHaveBeenCalled();
    });
    it('propagates discovery errors', async () => {
      const error = new Error('discovery failed');
      const executeTool = vi.fn();
      install({ getTools: vi.fn().mockRejectedValue(error), executeTool });
      await expect(invoke({})).rejects.toBe(error);
      expect(executeTool).not.toHaveBeenCalled();
    });
  });
}
it('lists safe metadata and checks tool presence', async () => {
  install({ getTools: async () => [{ ...tool, execute: () => undefined }] });
  await expect(listWebMcpTools()).resolves.toEqual([tool]);
  await expect(expectWebMcpTool(page, tool.name)).resolves.toBeUndefined();
  await expect(expectWebMcpTool(page, 'missing')).rejects.toThrow('missing');
  install(undefined);
  await expect(listWebMcpTools()).resolves.toEqual([]);
  await expect(expectWebMcpTool(page, tool.name)).rejects.toThrow(tool.name);
});
