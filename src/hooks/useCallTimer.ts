import { useState, useEffect } from 'react';
import { formatDuration } from '../utils/formatters';

interface CallSession {
  doctorId: string;
  startedAt: number;
}

let globalCallSession: CallSession | null = null;
let sessionGraceTimer: ReturnType<typeof setTimeout> | null = null;
let activeSubscribers = 0;
let globalTicker: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<(elapsed: number) => void>();

function startTickerIfNeeded() {
  if (globalTicker) return;
  globalTicker = setInterval(() => {
    if (globalCallSession) {
      const elapsed = Math.max(0, Math.floor((Date.now() - globalCallSession.startedAt) / 1000));
      listeners.forEach((listener) => listener(elapsed));
    }
  }, 500);
}

function stopTickerIfNoSubscribers() {
  if (activeSubscribers <= 0 && globalTicker) {
    clearInterval(globalTicker);
    globalTicker = null;
  }
}

/**
 * Resets the active call session timer when a call ends explicitly.
 */
export function resetGlobalCallTimer() {
  globalCallSession = null;
  if (sessionGraceTimer) {
    clearTimeout(sessionGraceTimer);
    sessionGraceTimer = null;
  }
  if (globalTicker) {
    clearInterval(globalTicker);
    globalTicker = null;
  }
  // Notify all active listeners to reset to 0
  listeners.forEach((listener) => listener(0));
}

/**
 * Reusable hook to manage call duration timer and MM:SS formatting.
 * Supports continuous, seamless timing when switching both Audio -> Video and Video -> Audio.
 */
export function useCallTimer(isActive: boolean, doctorId?: string | number | null) {
  const docKey = doctorId ? String(doctorId) : 'active_doctor';

  const getInitialSeconds = () => {
    if (globalCallSession) {
      return Math.max(0, Math.floor((Date.now() - globalCallSession.startedAt) / 1000));
    }
    return 0;
  };

  const [seconds, setSeconds] = useState<number>(getInitialSeconds);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    // Modal became active! Cancel any pending grace cleanup timer
    if (sessionGraceTimer) {
      clearTimeout(sessionGraceTimer);
      sessionGraceTimer = null;
    }

    activeSubscribers++;

    // Check if we need to start a brand new session or resume existing
    // If no session exists OR the session belongs to a completely different doctor/call
    const isDifferentDoctor =
      globalCallSession &&
      docKey !== 'active_doctor' &&
      globalCallSession.doctorId !== 'active_doctor' &&
      globalCallSession.doctorId !== docKey;

    if (!globalCallSession || isDifferentDoctor) {
      globalCallSession = {
        doctorId: docKey,
        startedAt: Date.now(),
      };
      setSeconds(0);
    } else {
      // Resume continuous time!
      const elapsed = Math.max(0, Math.floor((Date.now() - globalCallSession.startedAt) / 1000));
      setSeconds(elapsed);
    }

    // Subscribe this component to the central timer ticker
    const handleTick = (currentSeconds: number) => {
      setSeconds(currentSeconds);
    };
    listeners.add(handleTick);
    startTickerIfNeeded();

    return () => {
      listeners.delete(handleTick);
      activeSubscribers = Math.max(0, activeSubscribers - 1);

      if (activeSubscribers === 0) {
        stopTickerIfNoSubscribers();
        // Generous 10-second grace period for switching between audio <-> video calls
        if (globalCallSession) {
          sessionGraceTimer = setTimeout(() => {
            globalCallSession = null;
          }, 10000);
        }
      }
    };
  }, [isActive, docKey]);

  const formattedTime = formatDuration(seconds);

  return { seconds, formattedTime, resetTimer: resetGlobalCallTimer };
}
