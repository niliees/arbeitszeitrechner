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

  // Pause hinzufügen
  const addPause = () => {
    if (!started) return;
    setPauses([
      ...pauses,
      {
        id: Date.now().toString(),
        time: now,
        label: `Pause ${pauses.length + 1}`,
      },
    ]);
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

  // Render
  if (!started) {
    // Startscreen
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <main className="w-full max-w-md py-8">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-8 md:p-12 mb-8">
            <h1 className="text-4xl font-bold text-white mb-6 text-center">Arbeitszeit Rechner</h1>
            <label className="block text-sm font-medium text-slate-300 mb-3 uppercase tracking-wide">Startzeit</label>
            <input
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="w-full px-6 py-4 text-2xl font-medium text-white bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mb-6"
            />
            <button
              onClick={() => startTime && setStarted(true)}
              disabled={!startTime}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-all duration-200"
            >
              Start
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Timeline-Ansicht
  const timeline = getTimelineData();
  if (!timeline) return null;
  const width = 700;
  const height = 180;
  const startDate = new Date(timeline.startAt);
  const endDate = new Date(timeline.endAt);
  const overtimeDate = new Date(now);
  // Marker für Start, Ende, Pausen, Jetzt
  const startPos = getPosition(timeline.startAt, timeline);
  const endPos = getPosition(timeline.endAt, timeline);
  const nowPos = getPosition(now, timeline);
  const overtimePos = showOvertime ? getPosition(now, timeline) : null;
  // Pausen-Positionen
  const pauseMarkers = pauses.map(p => ({
    ...p,
    pos: getPosition(p.time, timeline)
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <main className="w-full max-w-4xl py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Arbeitszeit Timeline</h1>
          <button
            onClick={addPause}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
          >
            Pause hinzufügen
          </button>
        </div>
        <div className="relative flex flex-col items-center">
          <svg width={width} height={height} className="block mx-auto">
            {/* Kurvige Linie */}
            <path d={getCurvePath(width, height)} stroke="#64748b" strokeWidth={6} fill="none" />
            {/* Startpunkt */}
            <circle cx={startPos * width} cy={height * 0.7} r={14} fill="#2563eb" stroke="#fff" strokeWidth={3} />
            {/* Endpunkt */}
            <circle cx={endPos * width} cy={height * 0.7} r={14} fill="#a21caf" stroke="#fff" strokeWidth={3} />
            {/* Pausenmarker */}
            {pauseMarkers.map(p => (
              <g key={p.id}>
                <circle cx={p.pos * width} cy={height * 0.7 - 30} r={10} fill="#facc15" stroke="#fff" strokeWidth={2} />
                <text x={p.pos * width} y={height * 0.7 - 45} textAnchor="middle" fontSize={12} fill="#facc15">{p.label}</text>
              </g>
            ))}
            {/* Jetzt-Pfeil (Google Maps Stil) */}
            <g transform={`translate(${nowPos * width},${height * 0.7 - 20})`}>
              <polygon points="0,0 10,30 -10,30" fill="#38bdf8" stroke="#0ea5e9" strokeWidth={2} />
            </g>
            {/* Überzeitbereich */}
            {showOvertime && overtimePos && (
              <rect x={width * 0.5} y={height * 0.7 - 8} width={width * (overtimePos - 0.5)} height={16} fill="#22c55e" opacity={0.2} />
            )}
          </svg>
          <div className="flex justify-between w-full px-2 mt-2">
            <div className="text-left">
              <div className="text-slate-400 text-xs uppercase">Start</div>
              <div className="text-white font-mono text-lg">{formatTimeHHMM(startDate)}</div>
            </div>
            <div className="text-center">
              {showOvertime ? (
                <>
                  <div className="text-slate-400 text-xs uppercase">Ende</div>
                  <div className="text-white font-mono text-lg">{formatTimeHHMM(endDate)}</div>
                </>
              ) : null}
            </div>
            <div className="text-right">
              {showOvertime ? (
                <>
                  <div className="text-green-400 text-xs uppercase">+ Zeit</div>
                  <div className="text-green-400 font-mono text-lg">+{formatHMS(Math.floor((now - timeline.endAt) / 1000))}</div>
                </>
              ) : (
                <>
                  <div className="text-slate-400 text-xs uppercase">Ende</div>
                  <div className="text-white font-mono text-lg">{formatTimeHHMM(endDate)}</div>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Pausenliste */}
        {pauses.length > 0 && (
          <div className="mt-8 bg-slate-800/60 rounded-xl p-4">
            <div className="text-slate-300 font-semibold mb-2">Pausen</div>
            <ul className="space-y-1">
              {pauses.map(p => (
                <li key={p.id} className="text-slate-400 text-sm">
                  {p.label}: {formatTimeHHMM(new Date(p.time))}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
