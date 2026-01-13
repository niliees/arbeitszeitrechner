"use client";

import { useEffect, useState } from "react";

interface Pause {
  id: string;
  time: number;
  label: string;
}

export default function Home() {
  const [startTime, setStartTime] = useState("");
  const [started, setStarted] = useState(false);
  const [minEndAt, setMinEndAt] = useState<number | null>(null);
  const [pauses, setPauses] = useState<Pause[]>([]);
  const [now, setNow] = useState(Date.now());
  const [showOvertime, setShowOvertime] = useState(false);
  const [showPauseForm, setShowPauseForm] = useState(false);
  const [pauseTime, setPauseTime] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light'|'dark'>(() => (typeof window !== 'undefined' && localStorage.getItem('theme') === 'dark') ? 'dark' : 'light');

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  // Zeitformatierer
  const formatTimeHHMM = (date: Date) => date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false });
  const formatHMS = (totalSeconds: number) => {
    const sec = Math.floor(Math.abs(totalSeconds));
    const h = String(Math.floor(sec / 3600)).padStart(2, '0');
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // Endzeit berechnen
  useEffect(() => {
    if (startTime) {
      const [hours, minutes] = startTime.split(':').map(Number);
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

  // Clock tick
  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [started]);

  // Überzeit prüfen
  useEffect(() => {
    if (!minEndAt || !started) return;
    setShowOvertime(now > minEndAt);
  }, [now, minEndAt, started]);

  const handleAddPauseClick = () => { setPauseTime(''); setShowPauseForm(true); };

  const handlePauseSave = () => {
    const tl = getTimelineData();
    if (!pauseTime || !tl) return;
    const [hours, minutes] = pauseTime.split(":").map(Number);
    const d = new Date(); d.setHours(hours, minutes, 0, 0);
    setPauses(prev => [...prev, { id: Date.now().toString(), time: d.getTime(), label: `Pause ${prev.length + 1}` }]);
    setShowPauseForm(false);
    setToast('Pausenzeit gespeichert');
    setTimeout(() => setToast(null), 2500);
  };

  // Timeline helpers
  const getTimelineData = () => {
    if (!startTime || !minEndAt) return null;
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date(); startDate.setHours(hours, minutes, 0, 0);
    const startAt = startDate.getTime();
    const endAt = minEndAt!;
    const total = endAt - startAt;
    const overtime = showOvertime && now > endAt ? now - endAt : 0;
    return { startAt, endAt, total, overtime };
  };

  const getPosition = (t: number, timeline: {startAt:number,endAt:number,total:number,overtime:number}) => {
    if (t < timeline.startAt) return 0;
    if (timeline.overtime && t > timeline.endAt) return 0.5 + 0.5 * Math.min(1, (t - timeline.endAt) / (timeline.overtime || 1));
    if (t > timeline.endAt) return 1;
    return (t - timeline.startAt) / timeline.total * 0.5;
  };

  const getCurvePath = (w:number,h:number) => {
    const x0=0,y0=h*0.7,x1=w,y1=h*0.7,cx=w/2,cy=h*0.16; return `M${x0},${y0} Q${cx},${cy} ${x1},${y1}`;
  };

  // Startscreen
  if (!started) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <section className="card w-full full-bleed animate-fade-in">
          <div className="app-header mb-6">
            <div className="brand">
              <div className="logo">AZ</div>
              <div>
                <h1 className="text-2xl font-extrabold">Arbeitszeit</h1>
                <div className="muted text-sm">Dein smarter Tagesbegleiter</div>
              </div>
            </div>
            <div className="controls">
              <button className="btn btn-ghost" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? '☀️' : '🌙'}</button>
            </div>
          </div>

          <form className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); if (startTime) setStarted(true); }}>
            <label className="flex flex-col gap-2">
              <span className="muted text-xs uppercase font-semibold">Startzeit</span>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full p-3 text-2xl font-semibold mono" required />
            </label>
            <div className="flex gap-3">
              <button type="submit" disabled={!startTime} className="btn btn-primary w-full">Starten</button>
              <button type="button" className="btn btn-ghost" onClick={() => { setStartTime(''); setPauses([]); }}>Zurücksetzen</button>
            </div>
            <p className="muted text-sm">Standard: 7.6h Arbeit + 30min Pause</p>
          </form>
        </section>
      </main>
    );
  }

  // Timeline view
  const timeline = getTimelineData();
  if (!timeline) return null;
  const width = (typeof window !== 'undefined') ? Math.max(360, window.innerWidth - 20) : 700;
  const height = 200;
  const startDate = new Date(timeline.startAt);
  const endDate = new Date(timeline.endAt);
  const startPos = getPosition(timeline.startAt, timeline);
  const endPos = getPosition(timeline.endAt, timeline);
  const nowPos = getPosition(now, timeline);
  const overtimePos = showOvertime ? getPosition(now, timeline) : null;
  const pauseMarkers = pauses.map(p => ({ ...p, pos: getPosition(p.time, timeline) }));

  return (
    <main className="min-h-screen flex items-start justify-center py-10">
      <section className="card w-full full-bleed space-y-6">
        <div className="app-header">
          <div className="brand">
            <div className="logo">AZ</div>
            <div>
              <h2 className="text-xl font-extrabold">Arbeitszeit Timeline</h2>
              <div className="muted text-sm">Behalte deinen Tag im Blick</div>
            </div>
          </div>
          <div className="controls">
            <button className="btn btn-ghost" onClick={() => { setStarted(false); setToast('Session gestoppt'); setTimeout(()=>setToast(null),2000); }}>Stop</button>
            <button className="btn btn-primary" onClick={handleAddPauseClick}>+ Pause</button>
            <button className="btn btn-ghost" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? '☀️' : '🌙'}</button>
          </div>
        </div>

        {/* Timeline SVG */}
        <div className="timeline-wrap mx-auto">
          <svg width={width} height={height} className="block mx-auto">
            <defs>
              <linearGradient id="gline" x1="0%" x2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
            <path d={getCurvePath(width, height)} stroke="url(#gline)" strokeWidth={8} fill="none" strokeLinecap="round" />
            <circle cx={startPos * width} cy={height * 0.7} r={16} fill="#2563eb" stroke="#fff" strokeWidth={4} />
            <circle cx={endPos * width} cy={height * 0.7} r={16} fill="#a21caf" stroke="#fff" strokeWidth={4} />
            {pauseMarkers.map(p => (
              <g key={p.id}>
                <circle cx={p.pos * width} cy={height * 0.7 - 34} r={11} fill="#f59e0b" stroke="#fff" strokeWidth={3} />
                <text x={p.pos * width} y={height * 0.7 - 52} textAnchor="middle" fontSize={12} fill="#111">{p.label}</text>
              </g>
            ))}
            <g transform={`translate(${nowPos * width},${height * 0.7 - 26})`}>
              <polygon points="0,0 12,34 -12,34" fill="#06b6d4" stroke="#0891b2" strokeWidth={3} />
            </g>
            {showOvertime && overtimePos && (
              <rect x={width * 0.5} y={height * 0.7 - 12} width={width * (overtimePos - 0.5)} height={24} fill="#10b981" opacity={0.12} />
            )}
          </svg>

          <div className="timeline-caption">
            <div>
              <div className="muted text-xs uppercase">Start</div>
              <div className="mono font-bold text-lg">{formatTimeHHMM(startDate)}</div>
            </div>
            <div className="text-center">
              <div className="muted text-xs uppercase">Ende</div>
              <div className="mono font-bold text-lg">{formatTimeHHMM(endDate)}</div>
            </div>
            <div className="text-right">
              {showOvertime ? (
                <>
                  <div className="muted text-xs uppercase">+ Zeit</div>
                  <div className="text-green-500 mono font-bold text-lg">+{formatHMS(Math.floor((now - timeline.endAt) / 1000))}</div>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* Pausenliste */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="badge badge-accent">Pausen</span>
            <div className="muted">{pauses.length} eingetragen</div>
          </div>
          <ul className="space-y-2">
            {pauses.map(p => (
              <li key={p.id} className="flex items-center gap-4">
                <div className="mono text-sm">{formatTimeHHMM(new Date(p.time))}</div>
                <div className="muted text-sm">{p.label}</div>
              </li>
            ))}
          </ul>
        </div>

        {/* Pause Dialog */}
        {showPauseForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={() => setShowPauseForm(false)} />
            <div className="card w-full max-w-xs z-10">
              <h3 className="font-bold mb-3">Pausenzeit eintragen</h3>
              <input type="time" value={pauseTime} onChange={e => setPauseTime(e.target.value)} className="w-full p-2 mono mb-3" />
              <div className="flex justify-end gap-2">
                <button className="btn btn-ghost" onClick={() => setShowPauseForm(false)}>Abbrechen</button>
                <button className="btn btn-primary" onClick={handlePauseSave} disabled={!pauseTime}>Speichern</button>
              </div>
            </div>
          </div>
        )}

        {toast && <div className="toast">{toast}</div>}
      </section>
    </main>
  );
}
