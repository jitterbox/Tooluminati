import { MockModelContext } from './mock-model-context';

export function installModelContextMock(
  target: 'document' | 'navigator' = 'document',
): MockModelContext {
  const mock = new MockModelContext();
  const host = target === 'document' ? document : navigator;

  Object.defineProperty(host, 'modelContext', {
    configurable: true,
    value: mock,
  });

  return mock;
}
