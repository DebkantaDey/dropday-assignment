
export function randomLatency(minMs = 250, maxMs = 900): Promise<void> {
  const ms = minMs + Math.random() * (maxMs - minMs);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function shouldFail(rate: number): boolean {
  return Math.random() < rate;
}
