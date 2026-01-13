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

  // Render
  if (!started) {
    // Startscreen
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md shadow-2xl border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-2xl">
          <div className="p-8 pb-0">
            <h1 className="text-4xl font-bold text-center text-white tracking-tight mb-6">Arbeitszeit Rechner</h1>
            <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wide">Startzeit</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-6 py-4 text-2xl font-medium text-white bg-slate-900/70 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mb-6"
            />
          </div>
          <div className="p-8 pt-0">
            <button
              onClick={() => startTime && setStarted(true)}
              disabled={!startTime}
              className="w-full text-lg py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium transition-all duration-200"
            >
              Start
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Timeline-Ansicht
  const timeline = getTimelineData();
  if (!timeline) return null;
  const width = 700;
  const height = 220;
  const startDate = new Date(timeline.startAt);
  const endDate = new Date(timeline.endAt);
  // Marker für Start, Ende, Pausen, Jetzt
  const startPos = getPosition(timeline.startAt, timeline);
  const endPos = getPosition(timeline.endAt, timeline);
  const nowPos = getPosition(now, timeline);
  const overtimePos = showOvertime ? getPosition(now, timeline) : null;
  // Pausen-Positionen
  const pauseMarkers = pauses.map((p) => ({
    ...p,
    pos: getPosition(p.time, timeline)
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl shadow-2xl border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-2xl">
        <div className="flex flex-row items-center justify-between gap-4 p-8 pb-0">
          <h2 className="text-3xl font-bold text-white">Arbeitszeit Timeline</h2>
          <button
            onClick={handleAddPauseClick}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-4 py-2 rounded-lg text-base shadow-lg"
          >
            Pause hinzufügen
          </button>
        </div>
        <div className="p-8 pt-0">
          {/* Pausenformular als Dialog */}
          {showPauseForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 w-full max-w-xs shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-4">Pausenzeit wählen</h3>
                <input
                  type="time"
                  value={pauseTime}
                  onChange={(e) => setPauseTime(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-900 text-white border border-slate-700 mb-4"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={handlePauseSave}
                    disabled={!pauseTime}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:bg-slate-700"
                  >
                    Speichern
                  </button>
                  <button
                    onClick={() => setShowPauseForm(false)}
                    className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Timeline SVG */}
          <div className="relative flex flex-col items-center mt-2 mb-8">
            <svg width={width} height={height} className="block mx-auto">
              {/* Kurvige Linie */}
              <path d={getCurvePath(width, height)} stroke="#64748b" strokeWidth={7} fill="none" />
              {/* Startpunkt */}
              <circle cx={startPos * width} cy={height * 0.7} r={16} fill="#2563eb" stroke="#fff" strokeWidth={4} />
              {/* Endpunkt */}
              <circle cx={endPos * width} cy={height * 0.7} r={16} fill="#a21caf" stroke="#fff" strokeWidth={4} />
              {/* Pausenmarker */}
              {pauseMarkers.map((p) => (
                <g key={p.id}>
                  <circle cx={p.pos * width} cy={height * 0.7 - 35} r={12} fill="#facc15" stroke="#fff" strokeWidth={3} />
                  <text x={p.pos * width} y={height * 0.7 - 50} textAnchor="middle" fontSize={14} fill="#facc15" fontWeight="bold">{p.label}</text>
                </g>
              ))}
              {/* Jetzt-Pfeil (Google Maps Stil) */}
              <g transform={`translate(${nowPos * width},${height * 0.7 - 25})`}>
                <polygon points="0,0 13,38 -13,38" fill="#38bdf8" stroke="#0ea5e9" strokeWidth={3} />
              </g>
              {/* Überzeitbereich */}
              {showOvertime && overtimePos && (
                <rect x={width * 0.5} y={height * 0.7 - 10} width={width * (overtimePos - 0.5)} height={20} fill="#22c55e" opacity={0.18} />
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
            <div className="mt-8 bg-slate-800/60 rounded-xl p-4 shadow-xl">
              <div className="text-slate-300 font-semibold mb-2 flex items-center gap-2">
                <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-400 rounded px-2 py-0.5 text-xs font-bold">Pausen</span>
              </div>
              <ul className="space-y-1">
                {pauses.map((p) => (
                  <li key={p.id} className="text-slate-400 text-sm flex items-center gap-2">
                    <span className="font-mono text-yellow-300">{formatTimeHHMM(new Date(p.time))}</span>
                    <span className="text-xs text-yellow-400">{p.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
