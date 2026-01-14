import { useState, useEffect } from "react";

export interface Pause {
  id: string;
  time: number;
  label: string;
}

export function useTimeline(startTime: string) {
  const [started, setStarted] = useState(false);
  const [minEndAt, setMinEndAt] = useState<number | null>(null);
  const [pauses, setPauses] = useState<Pause[]>([]);
  const [now, setNow] = useState(Date.now());
  const [showOvertime, setShowOvertime] = useState(false);

  useEffect(() => {
    if (startTime) {
      const [hours, minutes] = startTime.split(":").map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);
      const minDate = new Date(startDate.getTime() + (7.6 * 60 + 30) * 60 * 1000);
      setMinEndAt(minDate.getTime());
    } else {
      setMinEndAt(null);
      setPauses([]);
      setStarted(false);
      setShowOvertime(false);
    }
  }, [startTime]);

  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [started]);

  useEffect(() => {
    if (!minEndAt || !started) return;
    setShowOvertime(now > minEndAt);
  }, [now, minEndAt, started]);

  const addPause = (pauseTime: string) => {
    const [hours, minutes] = pauseTime.split(":").map(Number);
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    setPauses((prev) => [
      ...prev,
      { id: Date.now().toString(), time: d.getTime(), label: `Pause ${prev.length + 1}` },
    ]);
  };

  const reset = () => {
    setStarted(false);
    setPauses([]);
    setShowOvertime(false);
  };

  return {
    started,
    setStarted,
    minEndAt,
    pauses,
    setPauses,
    now,
    showOvertime,
    addPause,
    reset,
  };
}
