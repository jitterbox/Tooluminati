export interface WebMcpComponentCatalogEntry {
  name: string;
  packageName: string;
  description: string;
  category: 'provider' | 'hook' | 'ui' | 'adapter';
}

export const webMcpComponentCatalog: WebMcpComponentCatalogEntry[] = [
  {
    name: 'WebMcpProvider',
    packageName: '@tooluminati/react',
    description: 'Registers tools and applies WebMCP policies for a React tree.',
    category: 'provider',
  },
  {
    name: 'WebMcpScope',
    packageName: '@tooluminati/react',
    description: 'Registers scoped tools with optional namespace segments.',
    category: 'provider',
  },
  {
    name: 'WebMcpSecurityBanner',
    packageName: '@tooluminati/react',
    description: 'Shows when diagnostics mode is enabled and lists tool names.',
    category: 'ui',
  },
  {
    name: 'useWebMcpTool',
    packageName: '@tooluminati/react',
    description: 'Registers a single tool for the lifetime of a component.',
    category: 'hook',
  },
  {
    name: 'WebMcpDebugPanel',
    packageName: '@tooluminati/devtools',
    description: 'Inspects registered tools and their safe metadata.',
    category: 'ui',
  },
  {
    name: 'provideWebMcpRegistry',
    packageName: '@tooluminati/angular',
    description: 'Registers tools and applies WebMCP policies for an Angular app.',
    category: 'provider',
  },
  {
    name: 'WebMcpScopeComponent',
    packageName: '@tooluminati/angular',
    description: 'Registers scoped tools with optional namespace segments.',
    category: 'provider',
  },
  {
    name: 'WebMcpSecurityBannerComponent',
    packageName: '@tooluminati/angular',
    description: 'Shows when diagnostics mode is enabled and lists tool names.',
    category: 'ui',
  },
  {
    name: 'registerWebMcpTool',
    packageName: '@tooluminati/angular',
    description: 'Registers a single tool for the lifetime of a component.',
    category: 'hook',
  },
  {
    name: 'WebMcpDebugPanelComponent',
    packageName: '@tooluminati/angular-devtools',
    description: 'Inspects registered tools and their safe metadata.',
    category: 'ui',
  },
  {
    name: 'WebMcpTroubleshootingPanel',
    packageName: '@tooluminati/react-troubleshooting',
    description:
      'Dev-only docked panel for WebMCP support, timeline, and errors.',
    category: 'ui',
  },
  {
    name: 'WebMcpTroubleshootingPanelComponent',
    packageName: '@tooluminati/angular-troubleshooting',
    description:
      'Angular dev panel mirroring WebMcpTroubleshootingPanel.',
    category: 'ui',
  },
];
