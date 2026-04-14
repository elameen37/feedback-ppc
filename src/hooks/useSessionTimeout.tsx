import { useEffect, useRef, useState, useCallback } from "react";

const IDLE_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];
const SESSION_START_KEY = "icpc_session_start";
const LAST_ACTIVITY_KEY = "icpc_last_activity";

interface UseSessionTimeoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onTimeout: () => void;
}

export const useSessionTimeout = ({
  timeoutMinutes = 15,
  warningMinutes = 2,
  onTimeout,
}: UseSessionTimeoutOptions) => {
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningMs = warningMinutes * 60 * 1000;

  // Persist session start time
  useEffect(() => {
    if (!sessionStorage.getItem(SESSION_START_KEY)) {
      sessionStorage.setItem(SESSION_START_KEY, new Date().toISOString());
    }
  }, []);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const resetTimer = useCallback(() => {
    clearTimers();
    setIsWarningVisible(false);
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());

    // Show warning before timeout
    warningRef.current = setTimeout(() => {
      setIsWarningVisible(true);
      setRemainingSeconds(warningMinutes * 60);
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, timeoutMs - warningMs);

    // Auto-logout on timeout
    timeoutRef.current = setTimeout(() => {
      clearTimers();
      setIsWarningVisible(false);
      sessionStorage.removeItem(SESSION_START_KEY);
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      onTimeout();
    }, timeoutMs);
  }, [clearTimers, timeoutMs, warningMs, warningMinutes, onTimeout]);

  const extendSession = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  // Check for stale session on mount (e.g., after refresh)
  useEffect(() => {
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (lastActivity) {
      const elapsed = Date.now() - parseInt(lastActivity, 10);
      if (elapsed > timeoutMs) {
        sessionStorage.removeItem(SESSION_START_KEY);
        localStorage.removeItem(LAST_ACTIVITY_KEY);
        onTimeout();
        return;
      }
    }
    resetTimer();
  }, []);

  // Listen for idle events
  useEffect(() => {
    const handleActivity = () => resetTimer();
    IDLE_EVENTS.forEach((event) => document.addEventListener(event, handleActivity, { passive: true }));
    return () => {
      IDLE_EVENTS.forEach((event) => document.removeEventListener(event, handleActivity));
      clearTimers();
    };
  }, [resetTimer, clearTimers]);

  const sessionStartTime = sessionStorage.getItem(SESSION_START_KEY) || new Date().toISOString();

  return {
    isWarningVisible,
    remainingSeconds,
    extendSession,
    sessionStartTime,
  };
};
