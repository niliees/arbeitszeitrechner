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
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full max-w-3xl h-20 flex items-center select-none" role="group" aria-label="Arbeitszeit-Timeline">
        {/* Timeline Bar */}
        <div className="absolute left-0 right-0 top-1/2 h-4 -translate-y-1/2 bg-gradient-to-r from-blue-300 via-blue-400 to-indigo-500 rounded-full shadow-lg transition-all duration-700" style={{ boxShadow: '0 0 32px 0 #4f8cff33, 0 2px 16px #7bb0ff22' }} />
        {/* Progress Fill */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 shadow-lg transition-all duration-700" style={{ width: `${progress * 100}%`, zIndex: 2, opacity: 0.7, boxShadow: '0 0 24px #4f8cff55' }} />
        {/* Start Marker */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 group">
          <div className="w-12 h-12 bg-blue-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center font-extrabold text-white text-xl ring-2 ring-blue-300 group-hover:ring-4 focus:ring-4 focus:outline-none transition-all duration-200" tabIndex={0} aria-label="Startzeit" />
        </div>
        {/* End Marker */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 group">
          <div className="w-12 h-12 bg-indigo-700 rounded-full border-4 border-white shadow-xl flex items-center justify-center font-extrabold text-white text-xl ring-2 ring-indigo-300 group-hover:ring-4 focus:ring-4 focus:outline-none transition-all duration-200" tabIndex={0} aria-label="Endzeit" />
        </div>
        {/* Progress Marker */}
        <div
          ref={timelineRef}
          className="absolute top-1/2 -translate-y-1/2 z-20 transition-all duration-700"
          style={{ left: `calc(${progress * 100}% - 24px)` }}
        >
          <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-extrabold text-xl shadow-2xl transition-all duration-300 ${isOver ? "bg-green-500 border-green-700 text-white animate-bounce" : "bg-white border-blue-400 text-blue-700 hover:scale-110 hover:shadow-blue-200/60 focus:scale-110"}`} tabIndex={0} aria-label={isOver ? "Fertig" : "Fortschritt"}>
            {isOver ? <span className="animate-pulse">✓</span> : <span className="text-3xl">•</span>}
          </div>
        </div>
      </div>
      {/* Zeitangaben */}
      <div className="w-full max-w-3xl flex justify-between mt-4 px-2 text-base md:text-lg font-mono text-gray-700 dark:text-gray-200">
        <span className="font-bold tracking-wide" aria-label="Startzeit-Anzeige">{start}</span>
        <span className="font-bold tracking-wide" aria-label="Endzeit-Anzeige">{end}</span>
      </div>
      {/* End-Message */}
      {isOver && (
        <div className="mt-10 text-center text-3xl font-extrabold text-green-600 animate-fade-in-up drop-shadow-lg">
          <span className="inline-block animate-bounce">🎉</span> Arbeitszeit beendet! Genieße deinen Feierabend!
        </div>
      )}
    </div>
  );
};
