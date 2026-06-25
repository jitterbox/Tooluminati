import { describe, expect, it } from 'vitest';
import { WebMcpForm } from './declarative-form';

describe('WebMcpForm', () => {
  it('renders WebMCP declarative spec attributes on the form', () => {
    const element = WebMcpForm({
      toolName: 'update_address',
      toolDescription: 'Update shipping address',
      toolAutoSubmit: true,
      children: null,
    });
    expect(element.props.toolname).toBe('update_address');
    expect(element.props.tooldescription).toBe('Update shipping address');
    expect(element.props.toolautosubmit).toBe('');
  });
});
