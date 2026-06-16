import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoUrl = 'git+https://github.com/jitterbox/Tooluminati.git';

const packageKeywords = {
  core: ['tooluminati', 'webmcp', 'react', 'model-context', 'agents'],
  policies: ['tooluminati', 'webmcp', 'react', 'security', 'policy'],
  react: ['tooluminati', 'webmcp', 'react', 'hooks', 'agents'],
  diagnostics: ['tooluminati', 'webmcp', 'react', 'diagnostics', 'observability'],
  testing: ['tooluminati', 'webmcp', 'react', 'testing', 'playwright'],
  forms: ['tooluminati', 'webmcp', 'react', 'forms', 'react-hook-form'],
  router: ['tooluminati', 'webmcp', 'react', 'router', 'react-router'],
  state: ['tooluminati', 'webmcp', 'react', 'redux', 'tanstack-query'],
  devtools: ['tooluminati', 'webmcp', 'react', 'devtools', 'debug'],
  angular: ['tooluminati', 'webmcp', 'angular', 'signals', 'agents'],
  'angular-forms': ['tooluminati', 'webmcp', 'angular', 'forms', 'signals'],
  'angular-router': ['tooluminati', 'webmcp', 'angular', 'router'],
  'angular-state': ['tooluminati', 'webmcp', 'angular', 'ngrx', 'signals'],
  'angular-devtools': ['tooluminati', 'webmcp', 'angular', 'devtools', 'debug'],
};

const packageDescriptions = {
  core: 'Core WebMCP registry and browser adapter for Tooluminati.',
  react: 'React provider, hooks, and scopes for Tooluminati.',
  policies: 'Policy presets for Tooluminati.',
  diagnostics: 'Runtime diagnostic tool factories for Tooluminati.',
  testing: 'Testing utilities for Tooluminati.',
  forms: 'Form diagnostics and submission adapters for Tooluminati.',
  router: 'Route and navigation diagnostics for Tooluminati.',
  state: 'Safe state and data-cache summaries for Tooluminati.',
  devtools: 'Developer tools panel for Tooluminati.',
  angular: 'Angular provider, directives, and scopes for Tooluminati.',
  'angular-forms': 'Angular Signal Forms adapters for Tooluminati.',
  'angular-router': 'Angular Router diagnostics adapters for Tooluminati.',
  'angular-state': 'NgRx and signal state adapters for Tooluminati.',
  'angular-devtools': 'Angular debug panel for Tooluminati.',
};

const packages = Object.keys(packageKeywords);

for (const name of packages) {
  const file = path.join(repoRoot, 'packages', name, 'package.json');
  const json = JSON.parse(readFileSync(file, 'utf8'));

  json.description = packageDescriptions[name];
  json.publishConfig = { access: 'public' };
  json.repository = {
    type: 'git',
    url: repoUrl,
    directory: `packages/${name}`,
  };
  json.bugs = { url: 'https://github.com/jitterbox/Tooluminati/issues' };
  json.homepage = 'https://github.com/jitterbox/Tooluminati#readme';
  json.keywords = packageKeywords[name];
  json.engines = { node: '>=18' };
  json.scripts.prepublishOnly = 'pnpm run build';

  writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`);
}

console.log(`Updated metadata for ${packages.length} packages.`);
