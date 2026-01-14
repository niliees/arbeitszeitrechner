
import React, { useRef, useMemo } from "react";

interface TimelineProps {
  start: string;
  end: string;
  now: string;
  isOver: boolean;
}

export const HorizontalTimeline: React.FC<TimelineProps> = ({ start, end, now, isOver }) => {
  // Animation für Marker
  const progress = useMemo(() => {
    const startTime = new Date(`1970-01-01T${start}:00`).getTime();
    const endTime = new Date(`1970-01-01T${end}:00`).getTime();
    const nowTime = new Date(`1970-01-01T${now}:00`).getTime();
    const total = endTime - startTime;
    const elapsed = Math.min(Math.max(nowTime - startTime, 0), total);
    return total > 0 ? elapsed / total : 0;
  }, [start, end, now]);
  const timelineRef = useRef<HTMLDivElement>(null);

  return (
    <div className="timeline fade-in-scale">
      <div className="relative w-full h-16 flex items-center select-none" role="group" aria-label="Arbeitszeit-Timeline">
        {/* Timeline Bar */}
        <div className="absolute left-0 right-0 top-1/2 h-3 -translate-y-1/2 bg-gradient-to-r from-bg-2 via-primary to-bg-1 rounded-full shadow-soft" />
        {/* Progress Fill */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-3 rounded-full bg-gradient-to-r from-primary to-accent shadow-glow" style={{ width: `${progress * 100}%`, zIndex: 2, opacity: 0.8 }} />
        {/* Start Marker */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold shadow-glow animate-fade-in-up" tabIndex={0} aria-label="Startzeit">⏱</div>
        </div>
        {/* End Marker */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-black font-bold shadow-glow animate-fade-in-up" tabIndex={0} aria-label="Endzeit">🏁</div>
        </div>
        {/* Progress Marker */}
        <div
          ref={timelineRef}
          className="absolute top-1/2 -translate-y-1/2 z-20 transition-all duration-700"
          style={{ left: `calc(${progress * 100}% - 16px)` }}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xl shadow-glow transition-all duration-300 ${isOver ? "bg-green-500 text-white animate-bounce" : "bg-primary text-white hover:scale-110"}`} tabIndex={0} aria-label={isOver ? "Fertig" : "Fortschritt"}>
            {isOver ? <span className="animate-pulse">✓</span> : <span className="text-2xl">•</span>}
          </div>
        </div>
      </div>
      {/* Zeitangaben */}
      <div className="flex justify-between mt-2 px-2 text-base font-mono text-muted">
        <span className="font-bold tracking-wide" aria-label="Startzeit-Anzeige">{start}</span>
        <span className="font-bold tracking-wide" aria-label="Endzeit-Anzeige">{end}</span>
      </div>
      {/* End-Message */}
      {isOver && (
        <div className="mt-8 text-center text-2xl font-extrabold text-green-500 animate-fade-in-up">
          <span className="inline-block animate-bounce">🎉</span> Arbeitszeit beendet!
        </div>
      )}
    </div>
  );
};
