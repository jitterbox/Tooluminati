import type { LoggingPolicy } from './types';

export function createLoggingPolicy(options: { remote?: boolean } = {}): LoggingPolicy {
  return {
    canLog(event) {
      if (options.remote) {
        return event === 'register' || event === 'unregister';
      }

      return true;
    },
  };
}

export const localLoggingPolicy = createLoggingPolicy();
export const remoteSafeLoggingPolicy = createLoggingPolicy({ remote: true });
