import { useEffect } from 'react';
import type { RefObject } from 'react';

export function useClickOutside({
  refs,
  onOutside,
  enabled = true,
}: {
  refs: Array<RefObject<HTMLElement | null>>;
  onOutside: (event: MouseEvent) => void;
  enabled?: boolean;
}) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      for (const ref of refs) {
        const el = ref.current;
        if (!el) continue;
        if (el.contains(target)) return;
      }

      onOutside(event);
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [enabled, onOutside, refs]);
}

