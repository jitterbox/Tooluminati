import { describe, expect, it, vi } from 'vitest';
import {
  createFormSubmitTool,
  createFormValidationSummaryTool,
  createWebMcpFormTools,
} from './create-form-tools';

describe('create-form-tools', () => {
  const baseOptions = {
    name: 'submit_ticket',
    description: 'Submit a support ticket.',
    getValues: () => ({ subject: 'Help', priority: 'low' as const }),
    setValues: vi.fn(async () => undefined),
    submit: vi.fn(async () => ({ success: true as const })),
  };

  it('creates submit and validation summary tools by default', () => {
    const tools = createWebMcpFormTools(baseOptions);
    expect(tools.map((tool) => tool.name)).toEqual([
      'submit_ticket',
      'submit_ticket_validation_summary',
    ]);
  });

  it('omits validation summary when disabled', () => {
    const tools = createWebMcpFormTools({
      ...baseOptions,
      includeValidationSummary: false,
    });
    expect(tools).toHaveLength(1);
    expect(tools[0]?.name).toBe('submit_ticket');
  });

  it('returns validation summary without submitting', async () => {
    const tool = createFormValidationSummaryTool({
      ...baseOptions,
      getErrors: () => [
        { kind: 'required', path: 'subject', message: 'Required' },
      ],
    });

    const summary = await tool.execute({}, {} as never);
    expect(summary.errors).toHaveLength(1);
    expect(summary.schema).toBeDefined();
  });

  it('submits through the submit tool execute handler', async () => {
    const submit = vi.fn(async () => ({
      success: true as const,
      message: 'ok',
    }));
    const tool = createFormSubmitTool({
      ...baseOptions,
      submit,
    });

    const result = await tool.execute(
      { subject: 'Help', priority: 'low' },
      {} as never,
    );
    expect(submit).toHaveBeenCalledOnce();
    expect(result).toBe('ok');
  });
});

it('annotates submission and validation separately, preserving explicit overrides', () => {
  const options = {
    name: 'save',
    description: 'Save form.',
    getValues: () => ({ name: '' }),
    setValues: vi.fn(),
    submit: vi.fn(),
  };
  expect(createFormSubmitTool(options).annotations).toEqual({
    readOnlyHint: false,
    consequentialHint: true,
    debugging: true,
  });
  expect(createFormValidationSummaryTool(options).annotations).toEqual({
    readOnlyHint: true,
    debugging: true,
  });
  const overridden = {
    ...options,
    annotations: {
      consequentialHint: false,
      debugging: false,
      untrustedContentHint: true,
    },
  };
  expect(createFormSubmitTool(overridden).annotations).toEqual({
    readOnlyHint: false,
    consequentialHint: false,
    debugging: false,
    untrustedContentHint: true,
  });
  expect(createFormValidationSummaryTool(overridden).annotations).toEqual({
    readOnlyHint: true,
    debugging: true,
  });
});
