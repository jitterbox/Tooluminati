export function anySignal(signals: AbortSignal[]): AbortSignal {
  const activeSignals = signals.filter(Boolean);

  if (activeSignals.length === 0) {
    return new AbortController().signal;
  }

  if (activeSignals.length === 1) {
    return activeSignals[0] as AbortSignal;
  }

  const controller = new AbortController();
  const abort = () => controller.abort();

  for (const signal of activeSignals) {
    if (signal.aborted) {
      controller.abort();
      break;
    }

    signal.addEventListener('abort', abort, { once: true });
  }

  return controller.signal;
}
