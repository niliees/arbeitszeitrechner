import { useState, useEffect, useMemo } from "react";

export interface Pause {
  id: string;
  time: number;
  label: string;
}

export function useTimeline(startTime: string) {
  const [started, setStarted] = useState(false);
  const minEndAt = useMemo(() => {
    if (startTime) {
      const [hours, minutes] = startTime.split(":").map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);
      const minDate = new Date(startDate.getTime() + (7.6 * 60 + 30) * 60 * 1000);
      return minDate.getTime();
    } else {
      return null;
    }
  }, [startTime]);
  const [pauses, setPauses] = useState<Pause[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const showOvertime = useMemo(() => {
    return minEndAt && started ? now > minEndAt : false;
  }, [now, minEndAt, started]);

  useEffect(() => {
    if (!startTime) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPauses([]);
       
      setStarted(false);
    }
  }, [startTime]);

  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [started]);

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
