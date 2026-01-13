'use client';

import { useState, useEffect } from "react";

interface Pause {
  id: string;
  time: number; // Timestamp (ms)
  label: string;
}

export default function Home() {
  const [startTime, setStartTime] = useState("");
  const [started, setStarted] = useState(false);
  const [minEndAt, setMinEndAt] = useState<number | null>(null);
  const [pauses, setPauses] = useState<Pause[]>([]);
  const [now, setNow] = useState(Date.now());
  const [isOvertime, setIsOvertime] = useState(false);
  const [showOvertime, setShowOvertime] = useState(false);
  const [showPauseForm, setShowPauseForm] = useState(false);
  const [pauseTime, setPauseTime] = useState("");

  // Zeitformatierer
  const formatTimeHHMM = (date: Date) => {
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };
  const formatHMS = (totalSeconds: number) => {
    const sec = Math.floor(Math.abs(totalSeconds));
    const h = String(Math.floor(sec / 3600)).padStart(2, '0');
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // Endzeit berechnen, wenn Startzeit gesetzt
  useEffect(() => {
    if (startTime) {
      const [hours, minutes] = startTime.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);
      // 7.6h Arbeit + 30min Pause = 8.1h
      const minDate = new Date(startDate.getTime() + (7.6 * 60 + 30) * 60 * 1000);
      setMinEndAt(minDate.getTime());
    } else {
      setMinEndAt(null);
      setPauses([]);
      setStarted(false);
      setShowOvertime(false);
    }
  }, [startTime]);

  // Zeit-Update für Pfeil und Überzeit
  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [started]);

  // Überzeit-Status prüfen
  useEffect(() => {
    if (!minEndAt || !started) return;
    if (now > minEndAt) {
      setIsOvertime(true);
      setShowOvertime(true);
    } else {
      setIsOvertime(false);
    }
  }, [now, minEndAt, started]);

  // Pause hinzufügen (öffnet Formular)
  const handleAddPauseClick = () => {
    setPauseTime("");
    setShowPauseForm(true);
  };

  // Pause speichern
  const handlePauseSave = () => {
    if (!pauseTime || !timeline) return;
    const [hours, minutes] = pauseTime.split(":").map(Number);
    const pauseDate = new Date();
    pauseDate.setHours(hours, minutes, 0, 0);
    setPauses([
      ...pauses,
      {
        id: Date.now().toString(),
        time: pauseDate.getTime(),
        label: `Pause ${pauses.length + 1}`,
      },
    ]);
    setShowPauseForm(false);
  };

  // SVG Timeline Parameter
  const getTimelineData = () => {
    if (!startTime || !minEndAt) return null;
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const startAt = startDate.getTime();
    const endAt = minEndAt;
    const total = endAt - startAt;
    // Für Überzeit: Timeline nach rechts verlängern
    let overtime = 0;
    if (showOvertime && now > endAt) {
      overtime = now - endAt;
    }
    return { startAt, endAt, total, overtime };
  };

  // Position auf Timeline (0...1)
  const getPosition = (t: number, timeline: {startAt: number, endAt: number, total: number, overtime: number}) => {
    if (t < timeline.startAt) return 0;
    if (timeline.overtime && t > timeline.endAt) {
      // Überzeitbereich: skaliert nach rechts
      return 0.5 + 0.5 * Math.min(1, (t - timeline.endAt) / (timeline.overtime || 1));
    }
    if (t > timeline.endAt) return 1;
    return (t - timeline.startAt) / timeline.total * 0.5;
  };

  // SVG-Path für Kurve (quadratische Bezier)
  const getCurvePath = (width: number, height: number) => {
    const x0 = 0, y0 = height * 0.7;
    const x1 = width, y1 = height * 0.7;
    const cx = width / 2, cy = height * 0.1;
    return `M${x0},${y0} Q${cx},${cy} ${x1},${y1}`;
  };

  // --- MODERNES UI ---
  // 1. Startscreen
  if (!started) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors">
        <section className="card max-w-lg w-full mx-auto animate-slide-down">
          <header className="mb-8 text-center">
            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">Arbeitszeit</h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg">Dein smarter Tagesbegleiter</p>
          </header>
          <form className="flex flex-col gap-6" onSubmit={e => { e.preventDefault(); if (startTime) setStarted(true); }}>
            <label className="flex flex-col gap-2">
              <span className="text-slate-600 dark:text-slate-300 text-sm font-semibold uppercase tracking-widest">Startzeit</span>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-6 py-4 text-2xl font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 shadow-sm"
                required
              />
            </label>
            <button
              type="submit"
              disabled={!startTime}
              className="w-full py-4 rounded-xl text-lg font-bold bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed text-white shadow-lg transition-all duration-200"
            >
              Starten
            </button>
          </form>
        </section>
      </main>
    );
  }

  // 2. Timeline-Ansicht
  const timeline = getTimelineData();
  if (!timeline) return null;
  const width = 700;
  const height = 220;
  const startDate = new Date(timeline.startAt);
  const endDate = new Date(timeline.endAt);
  const startPos = getPosition(timeline.startAt, timeline);
  const endPos = getPosition(timeline.endAt, timeline);
  const nowPos = getPosition(now, timeline);
  const overtimePos = showOvertime ? getPosition(now, timeline) : null;
  const pauseMarkers = pauses.map((p) => ({ ...p, pos: getPosition(p.time, timeline) }));

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors">
      <section className="card max-w-5xl w-full mx-auto animate-slide-down flex flex-col gap-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">Arbeitszeit Timeline</h2>
            <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg">Behalte deinen Tag im Blick</p>
          </div>
          <button
            onClick={handleAddPauseClick}
            className="px-6 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold text-base shadow-md transition-all duration-200"
          >
            + Pause eintragen
          </button>
        </header>
        {/* Pausenformular als Dialog */}
        {showPauseForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-slide-down">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 w-full max-w-xs shadow-2xl">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Pausenzeit eintragen</h3>
              <input
                type="time"
                value={pauseTime}
                onChange={e => setPauseTime(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 mb-4 text-lg font-semibold"
                required
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handlePauseSave}
                  disabled={!pauseTime}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold disabled:bg-slate-300 disabled:text-slate-400"
                >
                  Speichern
                </button>
                <button
                  onClick={() => setShowPauseForm(false)}
                  className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white px-5 py-2.5 rounded-lg font-bold"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Timeline SVG */}
        <div className="relative flex flex-col items-center mt-2 mb-8">
          <svg width={width} height={height} className="block mx-auto animate-fade-in">
            {/* Kurvige Linie */}
            <path d={getCurvePath(width, height)} stroke="#64748b" strokeWidth={7} fill="none" />
            {/* Startpunkt */}
            <circle cx={startPos * width} cy={height * 0.7} r={18} fill="#2563eb" stroke="#fff" strokeWidth={5} className="timeline-marker animate-pulse-slow" />
            {/* Endpunkt */}
            <circle cx={endPos * width} cy={height * 0.7} r={18} fill="#a21caf" stroke="#fff" strokeWidth={5} className="timeline-marker animate-pulse-slow" />
            {/* Pausenmarker */}
            {pauseMarkers.map((p) => (
              <g key={p.id} className="timeline-pause animate-bounce-slow">
                <circle cx={p.pos * width} cy={height * 0.7 - 38} r={13} fill="#facc15" stroke="#fff" strokeWidth={3} />
                <text x={p.pos * width} y={height * 0.7 - 55} textAnchor="middle" fontSize={15} fill="#facc15" fontWeight="bold">{p.label}</text>
              </g>
            ))}
            {/* Jetzt-Pfeil (Google Maps Stil) */}
            <g transform={`translate(${nowPos * width},${height * 0.7 - 28})`} className="timeline-arrow animate-bounce-slow">
              <polygon points="0,0 15,44 -15,44" fill="#38bdf8" stroke="#0ea5e9" strokeWidth={4} />
            </g>
            {/* Überzeitbereich */}
            {showOvertime && overtimePos && (
              <rect x={width * 0.5} y={height * 0.7 - 12} width={width * (overtimePos - 0.5)} height={24} fill="#22c55e" opacity={0.18} />
            )}
          </svg>
          <div className="flex justify-between w-full px-2 mt-4">
            <div className="text-left">
              <div className="text-slate-400 text-xs uppercase">Start</div>
              <div className="text-slate-900 dark:text-white font-mono text-xl font-bold">{formatTimeHHMM(startDate)}</div>
            </div>
            <div className="text-center">
              {showOvertime ? (
                <>
                  <div className="text-slate-400 text-xs uppercase">Ende</div>
                  <div className="text-slate-900 dark:text-white font-mono text-xl font-bold">{formatTimeHHMM(endDate)}</div>
                </>
              ) : null}
            </div>
            <div className="text-right">
              {showOvertime ? (
                <>
                  <div className="text-green-400 text-xs uppercase">+ Zeit</div>
                  <div className="text-green-400 font-mono text-xl font-bold">+{formatHMS(Math.floor((now - timeline.endAt) / 1000))}</div>
                </>
              ) : (
                <>
                  <div className="text-slate-400 text-xs uppercase">Ende</div>
                  <div className="text-slate-900 dark:text-white font-mono text-xl font-bold">{formatTimeHHMM(endDate)}</div>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Pausenliste */}
        {pauses.length > 0 && (
          <div className="mt-2 bg-slate-100 dark:bg-slate-800/60 rounded-xl p-6 shadow-xl animate-fade-in">
            <div className="text-slate-700 dark:text-slate-200 font-semibold mb-3 flex items-center gap-2">
              <span className="bg-yellow-400/20 text-yellow-700 dark:text-yellow-300 border border-yellow-300 rounded px-2 py-0.5 text-xs font-bold">Pausen</span>
            </div>
            <ul className="space-y-2">
              {pauses.map((p) => (
                <li key={p.id} className="text-slate-600 dark:text-slate-300 text-base flex items-center gap-2">
                  <span className="font-mono text-yellow-500 dark:text-yellow-300 text-lg">{formatTimeHHMM(new Date(p.time))}</span>
                  <span className="text-xs text-yellow-700 dark:text-yellow-300">{p.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}
