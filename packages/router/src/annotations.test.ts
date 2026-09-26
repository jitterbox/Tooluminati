import { expect, it } from 'vitest';
import {
  createCurrentRouteTool,
  createNavigationStateTool,
  createRouteContextTool,
} from './tools';
const provider = { getCurrentRoute: () => ({ pathname: '/' }) };
it.each([
  createCurrentRouteTool,
  createNavigationStateTool,
  createRouteContextTool,
])('annotates router diagnostics (%s)', (factory) => {
  expect(factory(provider).annotations).toEqual({
    readOnlyHint: true,
    debugging: true,
  });
});
