import { describe, expect, it } from 'vitest';
import { createWebMcpFormTools } from '@tooluminati/forms';

describe('provideWebMcpFormTool helpers', () => {
  it('creates submit and validation summary tools by default', () => {
    const tools = createWebMcpFormTools({
      name: 'support_ticket',
      description: 'Submit support ticket.',
      getValues: () => ({ subject: 'Help', body: 'Details' }),
      setValues: () => undefined,
      submit: () => ({ success: true }),
    });

    expect(tools.map((tool) => tool.name)).toEqual([
      'support_ticket',
      'support_ticket_validation_summary',
    ]);
  });

  it('omits validation summary when disabled', () => {
    const tools = createWebMcpFormTools({
      name: 'support_ticket',
      description: 'Submit support ticket.',
      includeValidationSummary: false,
      getValues: () => ({ subject: 'Help', body: 'Details' }),
      setValues: () => undefined,
      submit: () => ({ success: true }),
    });

    expect(tools).toHaveLength(1);
    expect(tools[0]?.name).toBe('support_ticket');
  });
});
