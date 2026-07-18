// Simulates real network conditions at the edge of the API boundary, so the
// client-side service module and UI have to handle latency and failure like
// they would against a real backend.

export function randomLatency(minMs = 250, maxMs = 900): Promise<void> {
  const ms = minMs + Math.random() * (maxMs - minMs);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ~7% baseline failure rate on reads, higher on writes to make contention and
// error handling visible during a normal walkthrough.
export function shouldFail(rate: number): boolean {
  return Math.random() < rate;
}
