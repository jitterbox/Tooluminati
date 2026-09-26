import type {
  BrowserModelContext,
  BrowserWebMcpToolDescriptor,
  WebMcpExecuteToolOptions,
  WebMcpRegisterToolOptions,
} from '@tooluminati/core';

export function parseExecuteToolInput(input: unknown): unknown {
  if (typeof input === 'string') {
    return JSON.parse(input || '{}') as unknown;
  }

  return input ?? {};
}

export class MockModelContext
  extends EventTarget
  implements BrowserModelContext
{
  readonly tools = new Map<string, BrowserWebMcpToolDescriptor>();
  readonly invocations: Array<{
    name: string;
    args: unknown;
    result?: unknown;
    error?: unknown;
  }> = [];

  registerTool(
    tool: BrowserWebMcpToolDescriptor,
    options: WebMcpRegisterToolOptions = {},
  ): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool already registered: ${tool.name}`);
    }

    if (options.signal?.aborted) {
      return;
    }

    this.tools.set(tool.name, tool);
    this.dispatchEvent(new Event('toolchange'));

    options.signal?.addEventListener(
      'abort',
      () => {
        this.tools.delete(tool.name);
        this.dispatchEvent(new Event('toolchange'));
      },
      { once: true },
    );
  }

  async getTools(): Promise<BrowserWebMcpToolDescriptor[]> {
    return [...this.tools.values()];
  }

  async executeTool(
    toolOrName: unknown,
    input: object | string = {},
    options: WebMcpExecuteToolOptions = {},
  ): Promise<unknown> {
    const name =
      typeof toolOrName === 'string'
        ? toolOrName
        : (toolOrName as { name?: string }).name;
    if (!name) {
      throw new Error('Tool name is required.');
    }

    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }

    const args = parseExecuteToolInput(input);
    try {
      const result = await tool.execute(args, {
        signal: options.signal ?? new AbortController().signal,
      });
      this.invocations.push({ name, args, result });
      return result;
    } catch (error) {
      this.invocations.push({ name, args, error });
      throw error;
    }
  }
}
