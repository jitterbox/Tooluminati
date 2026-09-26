import { expect, it } from 'vitest';
import {
  createAppInfoTool,
  createVisibleToolsTool,
  createActionAvailabilityTool,
  createListActionsTool,
  createFeatureFlagsTool,
  createHydrationHealthTool,
  createMountedFormsRegistry,
  createMountedFormsSummaryTool,
  createRecentClientErrorsTool,
  ClientErrorBuffer,
  createTroubleshootingTimelineTool,
  TroubleshootingTimelineBuffer,
  createWorkflowBlockersTool,
  createWebMcpEnvironmentTool,
  createWebMcpEnvironmentSummary,
} from './index';
const actions = { getActionAvailability: () => undefined };
const tools = [
  createAppInfoTool(() => ({ name: 'test' })),
  createVisibleToolsTool(),
  createActionAvailabilityTool(actions),
  createListActionsTool(actions),
  createFeatureFlagsTool(() => []),
  createHydrationHealthTool(() => ({ recoverableErrorCount: 0 })),
  createMountedFormsSummaryTool(createMountedFormsRegistry()),
  createRecentClientErrorsTool(new ClientErrorBuffer()),
  createTroubleshootingTimelineTool(new TroubleshootingTimelineBuffer()),
  createWorkflowBlockersTool({}),
  createWebMcpEnvironmentTool(() => createWebMcpEnvironmentSummary()),
];
it.each(tools.map((tool) => [tool.name, tool] as const))(
  '%s is annotated as a read-only diagnostic',
  (_name, tool) => {
    expect(tool.annotations).toMatchObject({
      readOnlyHint: true,
      debugging: true,
    });
    expect(tool.annotations?.consequentialHint).not.toBe(true);
  },
);
it.each(
  tools
    .filter((tool) =>
      [
        'get_recent_client_errors',
        'get_troubleshooting_timeline',
        'get_workflow_blockers',
      ].includes(tool.name),
    )
    .map((tool) => [tool.name, tool] as const),
)('%s retains untrusted-content annotation', (_name, tool) => {
  expect(tool.annotations?.untrustedContentHint).toBe(true);
});
