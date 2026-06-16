export interface WebMcpComponentCatalogEntry {
  name: string;
  packageName: string;
  description: string;
  category: 'provider' | 'hook' | 'ui' | 'adapter';
}

export const webMcpComponentCatalog: WebMcpComponentCatalogEntry[] = [
  {
    name: 'WebMcpProvider',
    packageName: '@react-webmcp-diagnostics/react',
    description: 'Registers tools and applies WebMCP policies for a React tree.',
    category: 'provider',
  },
  {
    name: 'WebMcpScope',
    packageName: '@react-webmcp-diagnostics/react',
    description: 'Registers scoped tools with optional namespace segments.',
    category: 'provider',
  },
  {
    name: 'WebMcpSecurityBanner',
    packageName: '@react-webmcp-diagnostics/react',
    description: 'Shows when diagnostics mode is enabled and lists tool names.',
    category: 'ui',
  },
  {
    name: 'useWebMcpTool',
    packageName: '@react-webmcp-diagnostics/react',
    description: 'Registers a single tool for the lifetime of a component.',
    category: 'hook',
  },
  {
    name: 'WebMcpDebugPanel',
    packageName: '@react-webmcp-diagnostics/devtools',
    description: 'Inspects registered tools and their safe metadata.',
    category: 'ui',
  },
];
