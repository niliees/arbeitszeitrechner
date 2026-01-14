
"use client";

import { useState } from "react";
import { useTimeline } from "../hooks/useTimeline";
import { useTheme } from "../hooks/useTheme";
import { formatTimeHHMM, formatHMS } from "../utils/time";
import { Timeline } from "../components/Timeline";
import { Toast } from "../components/Toast";
import { PauseDialog } from "../components/PauseDialog";
import { Header } from "../components/Header";

export default function Home() {
  const [startTime, setStartTime] = useState("");
  const [showPauseForm, setShowPauseForm] = useState(false);
  const [pauseTime, setPauseTime] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();
  const timeline = useTimeline(startTime);

  // Timeline helpers
  const getTimelineData = () => {
    if (!startTime || !timeline.minEndAt) return null;
    const [hours, minutes] = startTime.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const startAt = startDate.getTime();
    const endAt = timeline.minEndAt!;
    const total = endAt - startAt;
    const overtime = timeline.showOvertime && timeline.now > endAt ? timeline.now - endAt : 0;
    return { startAt, endAt, total, overtime };
  };

  const getPosition = (t: number, timelineData: { startAt: number; endAt: number; total: number; overtime: number }) => {
    if (t < timelineData.startAt) return 0;
    if (timelineData.overtime && t > timelineData.endAt)
      return 0.5 + 0.5 * Math.min(1, (t - timelineData.endAt) / (timelineData.overtime || 1));
    if (t > timelineData.endAt) return 1;
    return ((t - timelineData.startAt) / timelineData.total) * 0.5;
  };

  const getCurvePath = (w: number, h: number) => {
    const x0 = 0,
      y0 = h * 0.7,
      x1 = w,
      y1 = h * 0.7,
      cx = w / 2,
      cy = h * 0.16;
    return `M${x0},${y0} Q${cx},${cy} ${x1},${y1}`;
  };

  const handleAddPauseClick = () => {
    setPauseTime("");
    setShowPauseForm(true);
  };

  const handlePauseSave = () => {
    if (!pauseTime) return;
    timeline.addPause(pauseTime);
    setShowPauseForm(false);
    setToast("Pausenzeit gespeichert");
    setTimeout(() => setToast(null), 2500);
  };

  // Startscreen
  if (!timeline.started) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <section className="card w-full full-bleed animate-fade-in">
          <Header title="Arbeitszeit" subtitle="Dein smarter Tagesbegleiter">
            <button className="btn btn-ghost" onClick={toggleTheme} aria-label="Theme wechseln">
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </Header>
          <form
            className="flex flex-col gap-4"
            onSubmit={e => {
              e.preventDefault();
              if (startTime) timeline.setStarted(true);
            }}
          >
            <label className="flex flex-col gap-2">
              <span className="muted text-xs uppercase font-semibold">Startzeit</span>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full p-3 text-2xl font-semibold mono"
                required
              />
            </label>
            <div className="flex gap-3">
              <button type="submit" disabled={!startTime} className="btn btn-primary w-full">
                Starten
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setStartTime("");
                  timeline.setPauses([]);
                }}
              >
                Zurücksetzen
              </button>
            </div>
            <p className="muted text-sm">Standard: 7.6h Arbeit + 30min Pause</p>
          </form>
        </section>
      </main>
    );
  }

  // Timeline view
  const timelineData = getTimelineData();
  if (!timelineData) return null;
  const width = typeof window !== "undefined" ? Math.max(360, window.innerWidth - 20) : 700;
  const height = 200;
  const startDate = new Date(timelineData.startAt);
  const endDate = new Date(timelineData.endAt);

  return (
    <main className="min-h-screen flex items-start justify-center py-10">
      <section className="card w-full full-bleed space-y-6">
        <Header title="Arbeitszeit Timeline" subtitle="Behalte deinen Tag im Blick">
          <button
            className="btn btn-ghost"
            onClick={() => {
              timeline.setStarted(false);
              setToast("Session gestoppt");
              setTimeout(() => setToast(null), 2000);
            }}
          >
            Stop
          </button>
          <button className="btn btn-primary" onClick={handleAddPauseClick}>
            + Pause
          </button>
          <button className="btn btn-ghost" onClick={toggleTheme} aria-label="Theme wechseln">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </Header>

        {/* Timeline SVG */}
        <Timeline
          width={width}
          height={height}
          startAt={timelineData.startAt}
          endAt={timelineData.endAt}
          now={timeline.now}
          overtime={timelineData.overtime > 0}
          pauses={timeline.pauses}
          getPosition={t => getPosition(t, timelineData)}
          getCurvePath={getCurvePath}
          showOvertime={timeline.showOvertime}
        />
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
            {timeline.showOvertime ? (
              <>
                <div className="muted text-xs uppercase">+ Zeit</div>
                <div className="text-green-500 mono font-bold text-lg">
                  +{formatHMS(Math.floor((timeline.now - timelineData.endAt) / 1000))}
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Pausenliste */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="badge badge-accent">Pausen</span>
            <div className="muted">{timeline.pauses.length} eingetragen</div>
          </div>
          <ul className="space-y-2">
            {timeline.pauses.map(p => (
              <li key={p.id} className="flex items-center gap-4">
                <div className="mono text-sm">{formatTimeHHMM(new Date(p.time))}</div>
                <div className="muted text-sm">{p.label}</div>
              </li>
            ))}
          </ul>
        </div>

        {/* Pause Dialog */}
        {showPauseForm && (
          <PauseDialog
            pauseTime={pauseTime}
            setPauseTime={setPauseTime}
            onSave={handlePauseSave}
            onCancel={() => setShowPauseForm(false)}
            disabled={!pauseTime}
          />
        )}

        {toast && <Toast message={toast} />}
      </section>
    </main>
  );
}
