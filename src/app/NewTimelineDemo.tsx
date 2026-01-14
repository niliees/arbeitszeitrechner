"use client";
import { useEffect, useState } from "react";
import { HorizontalTimeline } from "../components/HorizontalTimeline";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function getNowString() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function NewTimelineDemo() {
  // Demo: Startzeit ist jetzt, Endzeit +7:36h
  const [start, setStart] = useState(getNowString());
  const [end, setEnd] = useState("");
  const [now, setNow] = useState(getNowString());
  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    // Endzeit berechnen (7h36min nach Start)
    const [h, m] = start.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(h, m, 0, 0);
    const endDate = new Date(startDate.getTime() + (7 * 60 + 36) * 60 * 1000);
    setEnd(`${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`);
  }, [start]);

  useEffect(() => {
    const id = setInterval(() => setNow(getNowString()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!end) return;
    const [eh, em] = end.split(":").map(Number);
    const [nh, nm] = now.split(":").map(Number);
    setIsOver(nh > eh || (nh === eh && nm >= em));
  }, [now, end]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="mb-8 w-full max-w-2xl flex flex-col md:flex-row gap-4 md:gap-8 items-center justify-center">
        <label className="flex flex-col text-sm font-semibold text-indigo-800 dark:text-indigo-200">
          Startzeit
          <input
            type="time"
            value={start}
            onChange={e => setStart(e.target.value)}
            className="mt-1 px-3 py-2 rounded-lg border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-indigo-950 text-lg font-mono shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </label>
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Aktuelle Zeit</span>
          <span className="text-2xl font-mono font-bold text-indigo-700 dark:text-indigo-200">{now}</span>
        </div>
        <label className="flex flex-col text-sm font-semibold text-indigo-800 dark:text-indigo-200">
          Endzeit
          <input
            type="time"
            value={end}
            readOnly
            className="mt-1 px-3 py-2 rounded-lg border border-indigo-200 dark:border-indigo-700 bg-gray-100 dark:bg-indigo-900 text-lg font-mono shadow-sm cursor-not-allowed"
          />
        </label>
      </div>
      <HorizontalTimeline start={start} end={end} now={now} isOver={isOver} />
    </div>
  );
}
