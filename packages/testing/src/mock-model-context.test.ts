import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import type {
  BrowserModelContext,
  WebMcpGetToolsOptions,
} from '@tooluminati/core';
import { MockModelContext, parseExecuteToolInput } from './mock-model-context';
import { MODEL_CONTEXT_MOCK_INIT_SCRIPT } from './model-context-mock-script';

const original = Object.getOwnPropertyDescriptor(document, 'modelContext');
afterEach(() => {
  if (original) Object.defineProperty(document, 'modelContext', original);
  else Reflect.deleteProperty(document, 'modelContext');
});
it.each([
  [{}, {}],
  ['{"id":2}', { id: 2 }],
  ['', {}],
  [undefined, {}],
  [null, {}],
])('parses %s', (input, expected) => {
  expect(parseExecuteToolInput(input)).toEqual(expected);
});
it('preserves object identity and rejects invalid JSON', () => {
  const args = { id: 2 };
  expect(parseExecuteToolInput(args)).toBe(args);
  expect(() => parseExecuteToolInput('{broken')).toThrow(SyntaxError);
});
it('accepts fromOrigins on the public discovery contract', () => {
  expectTypeOf<
    Parameters<NonNullable<BrowserModelContext['getTools']>>[0]
  >().toEqualTypeOf<WebMcpGetToolsOptions | undefined>();
});
for (const variant of ['class', 'init script'] as const) {
  const create = (): BrowserModelContext => {
    if (variant === 'class') return new MockModelContext();
    window.eval(MODEL_CONTEXT_MOCK_INIT_SCRIPT);
    return (document as Document & { modelContext: BrowserModelContext })
      .modelContext;
  };
  describe(variant, () => {
    it.each([{}, '{"id":2}', undefined])(
      'executes descriptor input %s and forwards client cancellation',
      async (input) => {
        const context = create();
        const client = new AbortController();
        const execute = vi.fn().mockResolvedValue('ok');
        context.registerTool({ name: 'read', description: 'Reads.', execute });
        const [tool] = await context.getTools!();
        await expect(
          context.executeTool!(tool, input, { signal: client.signal }),
        ).resolves.toBe('ok');
        expect(execute).toHaveBeenCalledExactlyOnceWith(
          parseExecuteToolInput(input),
          { signal: client.signal },
        );
        client.abort();
        expect(execute.mock.calls[0]![1].signal.aborted).toBe(true);
        expect(await context.getTools!()).toHaveLength(1);
      },
    );
    it('unregisters without aborting an executing callback', async () => {
      const context = create();
      const controller = new AbortController();
      let finish!: (value: string) => void;
      let signal!: AbortSignal;
      context.registerTool(
        {
          name: 'read',
          description: 'Reads.',
          execute: (_args, client) => {
            signal = client!.signal!;
            return new Promise<string>((resolve) => {
              finish = resolve;
            });
          },
        },
        { signal: controller.signal },
      );
      const result = context.executeTool!('read', {});
      controller.abort();
      expect(await context.getTools!()).toEqual([]);
      expect(signal.aborted).toBe(false);
      finish('finished');
      await expect(result).resolves.toBe('finished');
    });
    it('skips pre-aborted registrations and rejects missing tools and invalid JSON', async () => {
      const context = create();
      const controller = new AbortController();
      controller.abort();
      const execute = vi.fn();
      const tool = { name: 'read', description: 'Reads.', execute };
      context.registerTool(tool, { signal: controller.signal });
      expect(await context.getTools!()).toEqual([]);
      await expect(context.executeTool!('absent')).rejects.toThrow();
      await expect(context.executeTool!({})).rejects.toThrow();
      context.registerTool(tool);
      await expect(context.executeTool!('read', '{broken')).rejects.toThrow(
        SyntaxError,
      );
      expect(execute).not.toHaveBeenCalled();
    });
  });
}
it('records successful and failed invocations and emits toolchange on lifecycle changes', async () => {
  const context = new MockModelContext();
  const changed = vi.fn();
  context.addEventListener('toolchange', changed);
  const controller = new AbortController();
  const error = new Error('failed');
  const execute = vi
    .fn()
    .mockResolvedValueOnce('ok')
    .mockRejectedValueOnce(error);
  context.registerTool(
    { name: 'read', description: 'Reads.', execute },
    { signal: controller.signal },
  );
  await context.executeTool('read', {});
  await expect(context.executeTool('read', {})).rejects.toBe(error);
  expect(context.invocations).toEqual([
    { name: 'read', args: {}, result: 'ok' },
    { name: 'read', args: {}, error },
  ]);
  controller.abort();
  expect(changed).toHaveBeenCalledTimes(2);
});
