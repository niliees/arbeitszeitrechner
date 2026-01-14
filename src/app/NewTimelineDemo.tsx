
"use client";
import { useEffect, useState } from "react";

import { HorizontalTimeline } from "../components/HorizontalTimeline";

function TimeInput({ label, value, onChange, readOnly = false, ...props }: { label: string, value: string, onChange?: (e: any) => void, readOnly?: boolean, [key: string]: any }) {
  return (
    <label className="flex flex-col text-base font-semibold text-indigo-900 dark:text-indigo-100">
      <span className="mb-1 text-xs font-bold tracking-wide uppercase text-indigo-400 dark:text-indigo-300">{label}</span>
      <input
        type="time"
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className={`mt-1 px-5 py-3 rounded-xl border-2 border-indigo-200 dark:border-indigo-700 ${readOnly ? 'bg-gray-100 dark:bg-indigo-900 cursor-not-allowed opacity-80' : 'bg-white dark:bg-indigo-950'} text-xl font-mono shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200 hover:border-blue-400`}
        aria-label={label}
        {...props}
      />
    </label>
  );
}

function TimeDisplay({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-gray-400 dark:text-gray-500 mb-1 font-semibold tracking-wide uppercase">{label}</span>
      <span className="text-3xl font-mono font-extrabold text-indigo-700 dark:text-indigo-200 drop-shadow-lg animate-pulse-slow">{value}</span>
    </div>
  );
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function getNowString() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function NewTimelineDemo() {
  const [start, setStart] = useState(getNowString());
  const [end, setEnd] = useState("");
  const [now, setNow] = useState(getNowString());
  const [isOver, setIsOver] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Animation: sanftes Einblenden
  useEffect(() => {
    document.body.classList.add("animate-fade-in-up");
    return () => document.body.classList.remove("animate-fade-in-up");
  }, []);

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
    <div className="w-full flex flex-col items-center animate-fade-in-up">
      <div className="mb-10 w-full max-w-2xl flex flex-col md:flex-row gap-6 md:gap-12 items-center justify-center">
        <TimeInput label="Startzeit" value={start} onChange={e => setStart(e.target.value)} />
        <TimeDisplay label="Aktuelle Zeit" value={now} />
        <TimeInput label="Endzeit" value={end} readOnly />
      </div>
      <div className="w-full max-w-3xl">
        <HorizontalTimeline start={start} end={end} now={now} isOver={isOver} />
      </div>
      <button
        className="btn btn-ghost mt-10 text-base px-6 py-3 rounded-xl border border-indigo-200 dark:border-indigo-700 shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-all duration-200"
        onClick={() => setShowSettings(s => !s)}
        aria-expanded={showSettings}
        aria-controls="timeline-settings"
      >
        {showSettings ? "Einstellungen ausblenden" : "Erweiterte Einstellungen"}
      </button>
      {showSettings && (
        <div id="timeline-settings" className="mt-6 w-full max-w-xl p-6 rounded-2xl bg-white/80 dark:bg-indigo-950/80 shadow-xl border border-indigo-100 dark:border-indigo-800 animate-fade-in-up">
          <div className="text-lg font-bold mb-2 text-indigo-700 dark:text-indigo-200">(Platz für weitere Optionen)</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Hier könnten z.B. Pausen, andere Arbeitszeitmodelle oder Exportfunktionen ergänzt werden.</div>
        </div>
      )}
    </div>
  );
}
