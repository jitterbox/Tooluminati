import { describe, expect, it } from 'vitest';
import { createListActionsTool } from './action-availability';
import type { ActionAvailabilityProvider } from './action-availability';
import { createWorkflowBlockersTool } from './workflow-blockers';

describe('createWorkflowBlockersTool', () => {
  it('aggregates action and error sources', async () => {
    const provider: ActionAvailabilityProvider = {
      getActionAvailability: (id) => ({
        actionId: id,
        label: id,
        available: false,
        reasons: ['blocked'],
      }),
      listActions: () => [
        {
          actionId: 'submit',
          label: 'Submit',
          available: false,
          reasons: ['invalid form'],
        },
      ],
    };
    const tool = createWorkflowBlockersTool({
      actionProvider: provider,
      recentErrors: () => [
        {
          message: 'err',
          source: 'app',
          timestamp: new Date().toISOString(),
        },
      ],
    });
    const result = await tool.execute({}, {} as never);
    expect(result.actions[0]?.reasons).toContain('invalid form');
    expect(result.errors).toHaveLength(1);
  });
});

describe('createListActionsTool export', () => {
  it('is re-exported from action-availability', () => {
    expect(createListActionsTool).toBeDefined();
  });
});
