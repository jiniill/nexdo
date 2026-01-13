import { useCallback, useEffect, useRef, useState } from 'react';

export function useAttentionPulse(durationMs = 700) {
  const [isPulsing, setIsPulsing] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const clear = useCallback(() => {
    if (timeoutRef.current === null) return;
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  const trigger = useCallback(() => {
    clear();

    setIsPulsing(false);
    requestAnimationFrame(() => {
      setIsPulsing(true);
    });

    timeoutRef.current = window.setTimeout(() => {
      setIsPulsing(false);
      timeoutRef.current = null;
    }, durationMs);
  }, [clear, durationMs]);

  useEffect(() => {
    return () => clear();
  }, [clear]);

  return { isPulsing, trigger };
}

