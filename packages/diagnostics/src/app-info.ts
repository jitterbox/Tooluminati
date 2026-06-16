import type {
  VisibleToolSummary,
  WebMcpToolDescriptor,
} from '@tooluminati/core';

export interface AppInfo {
  name: string;
  version?: string;
  environment?: string;
  buildId?: string;
  webMcpEnabled?: boolean;
  webMcpSupported?: boolean;
  namespace?: string;
  [key: string]: unknown;
}

export function createAppInfoTool(
  getInfo: () => AppInfo,
  name = 'get_app_info',
): WebMcpToolDescriptor<Record<string, never>, AppInfo> {
  return {
    name,
    description:
      'Returns safe application metadata, environment, build, and WebMCP diagnostics status.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    execute: () => getInfo(),
  };
}

export function createVisibleToolsTool(
  name = 'get_visible_agent_tools',
): WebMcpToolDescriptor<
  Record<string, never>,
  { tools: VisibleToolSummary[] }
> {
  return {
    name,
    description:
      'Returns visible WebMCP tools with safe metadata such as names, descriptions, annotations, and scope.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    execute: (_args, context) => ({
      tools: context.registry.getVisibleToolSummaries(),
    }),
  };
}
