export interface PersistEnvelope<T> {
  version: number;
  state: T;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function loadFromLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;

    const parsed: unknown = JSON.parse(raw);
    if (!isObject(parsed)) return fallback;

    if ('state' in parsed) {
      const maybeState = (parsed as unknown as PersistEnvelope<T>).state;
      return maybeState ?? fallback;
    }

    return parsed as T;
  } catch {
    return fallback;
  }
}

export function saveToLocalStorage<T>(key: string, state: T, version = 1) {
  if (typeof window === 'undefined') return;
  const payload: PersistEnvelope<T> = { version, state };
  window.localStorage.setItem(key, JSON.stringify(payload));
}

export function removeFromLocalStorage(key: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(key);
}
