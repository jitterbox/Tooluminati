import { expect, test } from '@playwright/test';
import type { BrowserModelContext } from '../../packages/core/src/types';

for (const inputFormat of ['json-string', 'object'] as const) {
  test.describe(`native WebMCP contracts (${inputFormat})`, () => {
    test.skip(
      process.env.WEBMCP_REAL_CHROME !== '1',
      'Set WEBMCP_REAL_CHROME=1 with a compatible Chrome installation.',
    );
    test.beforeEach(async ({ page, browser }) => {
      const major = Number(browser.version().split('.')[0]);
      test.skip(
        inputFormat === 'object' && major < 155,
        'Object input requires Chrome 155+; legacy contracts still run.',
      );
      test.skip(
        major < 153,
        'Independent unregister/execute lifetime requires Chrome 153+.',
      );
      await page.route('http://localhost:4199/**', (route) =>
        route.fulfill({
          contentType: 'text/html',
          body: '<!doctype html><title>Native WebMCP test</title>',
        }),
      );
      await page.goto('http://localhost:4199/');
      expect(
        await page.evaluate(() => {
          const context = (
            document as Document & { modelContext?: BrowserModelContext }
          ).modelContext;
          return ['registerTool', 'getTools', 'executeTool'].every(
            (name) =>
              typeof context?.[name as keyof BrowserModelContext] ===
              'function',
          );
        }),
        'Native WebMCP APIs must be present; no mock is injected.',
      ).toBe(true);
    });
    test('discovers metadata, executes input, and removes an aborted registration', async ({
      page,
    }) => {
      const result = await page.evaluate(async (format) => {
        const context = (
          document as Document & { modelContext: BrowserModelContext }
        ).modelContext;
        const controller = new AbortController();
        try {
          await context.registerTool(
            {
              name: 'alignment_echo',
              title: 'Alignment echo',
              description: 'Echo test input.',
              inputSchema: {
                type: 'object',
                properties: { marker: { type: 'string' } },
                required: ['marker'],
              },
              annotations: { readOnlyHint: true, debugging: true },
              execute: (args) => args,
            },
            { signal: controller.signal },
          );
          const tool = (
            await context.getTools!({ fromOrigins: [location.origin] })
          ).find((entry) => entry.name === 'alignment_echo');
          if (!tool) throw new Error('Registered tool was not discoverable');
          const output = await context.executeTool!(
            tool,
            format === 'object'
              ? { marker: 'native-input' }
              : JSON.stringify({ marker: 'native-input' }),
          );
          controller.abort();
          const remaining = await context.getTools!();
          return {
            title: tool.title,
            annotations: tool.annotations,
            output,
            removed: !remaining.some((entry) => entry.name === tool.name),
          };
        } finally {
          controller.abort();
        }
      }, inputFormat);
      expect(result.title).toBe('Alignment echo');
      expect(result.annotations).toMatchObject({ readOnlyHint: true });
      // Chrome 154 omits debugging from its discovered metadata.
      if (inputFormat === 'object')
        expect(result.annotations).toMatchObject({ debugging: true });
      expect(JSON.stringify(result.output)).toContain('native-input');
      expect(result.removed).toBe(true);
    });
    test('unregister leaves an in-flight execution alive', async ({ page }) => {
      const result = await page.evaluate(async (format) => {
        const context = (
          document as Document & { modelContext: BrowserModelContext }
        ).modelContext;
        const registration = new AbortController();
        let started!: () => void;
        let finish!: (result: { marker: string }) => void;
        let clientSignal: AbortSignal | undefined;
        const began = new Promise<void>((resolve) => {
          started = resolve;
        });
        try {
          await context.registerTool(
            {
              name: 'alignment_pending',
              description: 'Completes a pending read.',
              inputSchema: { type: 'object', properties: {} },
              annotations: { readOnlyHint: true },
              execute: (_args, client) => {
                clientSignal = client?.signal;
                const pending = new Promise<{ marker: string }>((resolve) => {
                  finish = resolve;
                });
                started();
                return pending;
              },
            },
            { signal: registration.signal },
          );
          const tool = (await context.getTools!()).find(
            (entry) => entry.name === 'alignment_pending',
          );
          const execution = context.executeTool!(
            tool,
            format === 'object' ? {} : '{}',
          );
          // Observe early rejection too, so a browser regression produces a useful failure.
          await Promise.race([
            began,
            execution.then(() => {
              throw new Error('Execution completed before callback started');
            }),
          ]);
          registration.abort();
          const aborted = clientSignal?.aborted ?? false;
          finish({ marker: 'completed-after-unregister' });
          return {
            aborted,
            output: await execution,
            removed: !(await context.getTools!()).some(
              (entry) => entry.name === 'alignment_pending',
            ),
          };
        } finally {
          registration.abort();
        }
      }, inputFormat);
      expect(result.aborted).toBe(false);
      expect(result.removed).toBe(true);
      expect(JSON.stringify(result.output)).toContain(
        'completed-after-unregister',
      );
    });
  });
}
