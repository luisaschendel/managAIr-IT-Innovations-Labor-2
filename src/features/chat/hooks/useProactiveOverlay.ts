// Queue, badge count, and open state for the AssistantOverlay.

import { useState, useCallback, useRef, useEffect } from "react";
import type { Message } from "../../../types/message";

export interface ProactiveEntry {
  id: string;
  message: Message;
  projectName: string;
}

export function useProactiveOverlay() {
  const [queue, setQueue] = useState<ProactiveEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  // Last dismissed entry so the user can always re-open the assistant
  const [lastEntry, setLastEntry] = useState<ProactiveEntry | null>(null);

  // Stable ref so snooze can read the current item without capturing stale state
  const queueRef = useRef<ProactiveEntry[]>([]);
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  /** Push a new proactive message — auto-opens the overlay. */
  const push = useCallback((projectName: string, message: Message) => {
    const entry: ProactiveEntry = {
      id: `overlay-${Date.now()}`,
      message,
      projectName,
    };
    setQueue((prev) => [...prev, entry]);
    setIsOpen(true);
  }, []);

  /** Permanently dismiss the front-of-queue entry (remembers it for re-open). */
  const dismiss = useCallback(() => {
    setQueue((prev) => {
      if (prev[0]) setLastEntry(prev[0]);
      return prev.slice(1);
    });
    setIsOpen(false);
  }, []);

  /**
   * Snooze the current entry: remove it now and re-inject after `minutes`.
   * Uses a ref read to avoid side effects inside state updaters.
   */
  const snooze = useCallback((minutes: number) => {
    const entry = queueRef.current[0];
    if (!entry) return;
    setQueue((prev) => prev.slice(1));
    setIsOpen(false);
    setTimeout(() => {
      setQueue((q) => [...q, entry]);
      setIsOpen(true);
    }, minutes * 60 * 1000);
  }, []);

  /** Toggle overlay open/closed (used by the FAB). */
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  // What to display: a pending entry takes priority, else the last dismissed one
  const displayEntry = queue[0] ?? lastEntry ?? null;

  return {
    current: queue[0] ?? null,
    displayEntry,
    badgeCount: queue.length,
    isOpen,
    toggle,
    dismiss,
    snooze,
    push,
  };
}
