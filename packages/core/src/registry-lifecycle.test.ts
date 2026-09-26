import { describe, expect, it, vi } from 'vitest';
import { MockModelContext } from '@tooluminati/testing';
import { WebMcpRegistry } from './registry';
import type { BrowserModelContext } from './types';
import { WebMcpRegistrationError } from './errors';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
const tool = {
  name: 'read_status',
  description: 'Reads status.',
  execute: () => ({ ok: true }),
};
describe('registration readiness and ownership', () => {
  it('waits for async browser registration and resolves synchronous registration', async () => {
    const pending = deferred<void>();
    const modelContext: BrowserModelContext = Object.assign(new EventTarget(), {
      registerTool: vi.fn(() => pending.promise),
    });
    const registry = new WebMcpRegistry({ enabled: true, modelContext });
    const registration = registry.registerTool(tool);
    const ready = vi.fn();
    void registration.ready.then(ready);
    await Promise.resolve();
    expect(ready).not.toHaveBeenCalled();
    pending.resolve();
    await expect(registration.ready).resolves.toBeUndefined();
    expect(ready).toHaveBeenCalledOnce();
    const sync = new WebMcpRegistry({
      enabled: true,
      modelContext: new MockModelContext(),
    });
    await expect(sync.registerTool(tool).ready).resolves.toBeUndefined();
  });
  it.each(['sync', 'async'] as const)(
    'cleans up %s failures and permits re-registration',
    async (mode) => {
      const failure = new Error('registration failed');
      const registerTool = vi.fn((): void | Promise<void> => {
        if (mode === 'sync') throw failure;
        return Promise.reject(failure);
      });
      const onError = vi.fn();
      const registry = new WebMcpRegistry({
        enabled: true,
        namespace: 'test',
        modelContext: Object.assign(new EventTarget(), { registerTool }),
        onError,
      });
      const failed = registry.registerTool(tool);
      await expect(failed.ready).rejects.toBeInstanceOf(
        WebMcpRegistrationError,
      );
      expect(onError).toHaveBeenCalledExactlyOnceWith(failure, {
        operation: 'registerTool',
        toolName: tool.name,
      });
      expect(registry.getRegisteredToolNames()).toEqual([]);
      registerTool.mockImplementation(() => undefined);
      const replacement = registry.registerTool(tool);
      failed.abort();
      expect(registry.getRegisteredToolsForDebug()).toEqual([replacement]);
      await expect(replacement.ready).resolves.toBeUndefined();
    },
  );
  it('late rejection after unregister cannot remove the replacement', async () => {
    const pending = deferred<void>();
    const registerTool = vi.fn((): void | Promise<void> => pending.promise);
    const registry = new WebMcpRegistry({
      enabled: true,
      modelContext: Object.assign(new EventTarget(), { registerTool }),
    });
    const old = registry.registerTool(tool);
    old.abort();
    registerTool.mockImplementation(() => undefined);
    const replacement = registry.registerTool(tool);
    pending.reject(new Error('late failure'));
    await expect(old.ready).rejects.toBeInstanceOf(WebMcpRegistrationError);
    expect(registry.getRegisteredToolsForDebug()).toEqual([replacement]);
  });
  it('strict sync failures throw and release the name', () => {
    const registerTool = vi.fn(() => {
      throw new Error('failure');
    });
    const registry = new WebMcpRegistry({
      enabled: true,
      strict: true,
      modelContext: Object.assign(new EventTarget(), { registerTool }),
    });
    expect(() => registry.registerTool(tool)).toThrow(WebMcpRegistrationError);
    expect(registry.getRegisteredToolNames()).toEqual([]);
  });
  it('forwards title, schema, annotations, origin allowlist, and registration signal', async () => {
    const modelContext = new MockModelContext();
    const register = vi.spyOn(modelContext, 'registerTool');
    const registry = new WebMcpRegistry({ enabled: true, modelContext });
    const descriptor = {
      ...tool,
      title: 'Status',
      inputSchema: { type: 'object' as const },
      annotations: {
        readOnlyHint: true,
        debugging: true,
        consequentialHint: false,
        untrustedContentHint: true,
      },
    };
    const registration = registry.registerTool(descriptor, {
      exposedTo: ['https://agent.example'],
    });
    expect(register).toHaveBeenCalledWith(
      expect.objectContaining({ ...descriptor, execute: expect.any(Function) }),
      { signal: registration.signal, exposedTo: ['https://agent.example'] },
    );
    expect(registry.getVisibleToolSummaries()[0]).toMatchObject({
      title: descriptor.title,
      annotations: descriptor.annotations,
    });
  });
});

describe('execution cancellation', () => {
  it('completes pending execution after unregister, with an independent client signal', async () => {
    const modelContext = new MockModelContext();
    const registry = new WebMcpRegistry({ enabled: true, modelContext });
    const pending = deferred<{ ok: boolean }>();
    const client = new AbortController();
    const execute = vi.fn((_args, context) => {
      expect(context.signal).toBe(client.signal);
      return pending.promise;
    });
    const registration = registry.registerTool({ ...tool, execute });
    const result = modelContext.executeTool(
      tool.name,
      {},
      { signal: client.signal },
    );
    expect(execute).toHaveBeenCalledOnce();
    registration.abort();
    expect(registration.signal.aborted).toBe(true);
    expect(client.signal.aborted).toBe(false);
    expect(await modelContext.getTools()).toEqual([]);
    pending.resolve({ ok: true });
    await expect(result).resolves.toEqual({ ok: true });
  });
  it('forwards cancellation to one overlapping invocation without unregistering the tool', async () => {
    const modelContext = new MockModelContext();
    const registry = new WebMcpRegistry({ enabled: true, modelContext });
    const controllers = [new AbortController(), new AbortController()];
    const pending = deferred<{ ok: boolean }>();
    const signals: AbortSignal[] = [];
    registry.registerTool({
      ...tool,
      execute: (_args, { signal }) => {
        signals.push(signal);
        return new Promise((resolve, reject) => {
          signal.addEventListener('abort', () => reject(signal.reason), {
            once: true,
          });
          void pending.promise.then(resolve);
        });
      },
    });
    const first = modelContext.executeTool(
      tool.name,
      {},
      { signal: controllers[0]!.signal },
    );
    const second = modelContext.executeTool(
      tool.name,
      {},
      { signal: controllers[1]!.signal },
    );
    const failure = new Error('client cancelled');
    controllers[0]!.abort(failure);
    await expect(first).rejects.toBe(failure);
    expect(signals[1]!.aborted).toBe(false);
    expect(registry.getRegisteredToolNames()).toEqual([tool.name]);
    pending.resolve({ ok: true });
    await expect(second).resolves.toEqual({ ok: true });
  });
  it('provides an un-aborted signal when the browser omits the client context', async () => {
    const modelContext = new MockModelContext();
    const registry = new WebMcpRegistry({ enabled: true, modelContext });
    let signal: AbortSignal | undefined;
    const registration = registry.registerTool({
      ...tool,
      execute: (_args, context) => {
        signal = context.signal;
        return {};
      },
    });
    await modelContext.tools.get(tool.name)!.execute({});
    registration.abort();
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(signal!.aborted).toBe(false);
  });
});

it('observes registration promises from another JavaScript realm', async () => {
  const { runInNewContext } = await import('node:vm');
  const promise = runInNewContext(
    'Promise.reject(new Error("foreign failure"))',
  ) as Promise<void>;
  expect(promise instanceof Promise).toBe(false);
  const modelContext = Object.assign(new EventTarget(), {
    registerTool: () => promise,
  });
  const registry = new WebMcpRegistry({ enabled: true, modelContext });
  await expect(registry.registerTool(tool).ready).rejects.toBeInstanceOf(
    WebMcpRegistrationError,
  );
  expect(registry.getRegisteredToolNames()).toEqual([]);
});

it('honors disabled navigator fallback at the registry boundary', () => {
  const original = Object.getOwnPropertyDescriptor(navigator, 'modelContext');
  const modelContext = new MockModelContext();
  Object.defineProperty(navigator, 'modelContext', {
    configurable: true,
    value: modelContext,
  });
  try {
    const registry = new WebMcpRegistry({
      enabled: true,
      allowNavigatorFallback: false,
    });
    registry.registerTool(tool);
    expect(modelContext.tools.size).toBe(0);
    expect(registry.getRegisteredToolNames()).toEqual([]);
  } finally {
    if (original) Object.defineProperty(navigator, 'modelContext', original);
    else Reflect.deleteProperty(navigator, 'modelContext');
  }
});
