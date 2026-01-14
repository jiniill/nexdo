export function formatDurationShort(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${sec}s`;
}

export function computeTrackedSeconds(task: { trackedSeconds?: number; trackingStartedAt?: string }, nowMs: number) {
  const base = task.trackedSeconds ?? 0;
  if (!task.trackingStartedAt) return base;
  const started = Date.parse(task.trackingStartedAt);
  if (!Number.isFinite(started)) return base;
  const delta = Math.max(0, Math.floor((nowMs - started) / 1000));
  return base + delta;
}

