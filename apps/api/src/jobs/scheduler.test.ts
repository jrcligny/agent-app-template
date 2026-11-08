import { afterEach, describe, expect, it, vi } from "vitest";
import { startJobScheduler } from "./scheduler.js";

afterEach(() => {
  vi.useRealTimers();
});

describe("job scheduler", () => {
  it("keeps ticking after an error and stops cleanly", async () => {
    vi.useFakeTimers();
    let calls = 0;
    const errors: unknown[] = [];
    const scheduler = startJobScheduler({
      enabled: true,
      intervalMs: 100,
      advance: async () => {
        calls += 1;
        if (calls === 1) throw new Error("advance failed");
      },
      onError: (error) => errors.push(error),
    });
    await vi.advanceTimersByTimeAsync(250);
    expect(calls).toBeGreaterThanOrEqual(2);
    expect(errors).toHaveLength(1);
    await scheduler.stop();
    const stoppedAt = calls;
    await vi.advanceTimersByTimeAsync(500);
    expect(calls).toBe(stoppedAt);
  });

  it("does not advance when the scheduler is disabled", async () => {
    vi.useFakeTimers();
    let calls = 0;
    const scheduler = startJobScheduler({
      enabled: false,
      intervalMs: 100,
      advance: async () => {
        calls += 1;
      },
    });
    await vi.advanceTimersByTimeAsync(500);
    expect(calls).toBe(0);
    await scheduler.stop();
  });
});
