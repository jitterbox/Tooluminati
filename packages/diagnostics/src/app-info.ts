import type { WebMcpToolDescriptor } from '@react-webmcp-diagnostics/core';

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
): WebMcpToolDescriptor<Record<string, never>, { tools: string[] }> {
  return {
    name,
    description:
      'Returns the WebMCP diagnostic tools currently registered by this app scope.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    execute: (_args, context) => ({
      tools: context.registry.getRegisteredToolNames(),
    }),
  };
}
