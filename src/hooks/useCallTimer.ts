import { useState, useEffect } from 'react';
import { formatDuration } from '../utils/formatters';

/**
 * Reusable hook to manage call duration timer and MM:SS formatting.
 * Eliminates duplicate timer state logic between AudioCallModal and VideoCallModal.
 */
export function useCallTimer(isActive: boolean) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isActive) {
      setSeconds(0);
      timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive]);

  const formattedTime = formatDuration(seconds);

  return { seconds, formattedTime };
}
