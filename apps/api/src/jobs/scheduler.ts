export type JobScheduler = {
  stop: () => Promise<void>;
};

export function startJobScheduler(options: {
  enabled: boolean;
  intervalMs?: number;
  advance: () => Promise<unknown>;
  onError?: (error: unknown) => void;
}): JobScheduler {
  if (!options.enabled) {
    return {
      async stop() {
        return undefined;
      },
    };
  }

  let stopped = false;
  let current: Promise<void> | null = null;
  const timer = setInterval(() => {
    if (stopped || current) return;
    current = Promise.resolve()
      .then(() => options.advance())
      .then(() => undefined)
      .catch((error: unknown) => {
        options.onError?.(error);
      })
      .finally(() => {
        current = null;
      });
  }, options.intervalMs ?? 300);

  return {
    async stop() {
      stopped = true;
      clearInterval(timer);
      if (current) await current;
    },
  };
}
