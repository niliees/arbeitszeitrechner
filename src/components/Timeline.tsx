import React from "react";
import { Pause } from "../hooks/useTimeline";

interface TimelineProps {
  width: number;
  height: number;
  startAt: number;
  endAt: number;
  now: number;
  overtime: boolean;
  pauses: Pause[];
  getPosition: (t: number) => number;
  getCurvePath: (w: number, h: number) => string;
  showOvertime: boolean;
}

export const Timeline: React.FC<TimelineProps> = ({
  width,
  height,
  startAt,
  endAt,
  now,
  overtime,
  pauses,
  getPosition,
  getCurvePath,
  showOvertime,
}) => {
  const startPos = getPosition(startAt);
  const endPos = getPosition(endAt);
  const nowPos = getPosition(now);
  const overtimePos = showOvertime ? getPosition(now) : null;
  const pauseMarkers = pauses.map((p) => ({ ...p, pos: getPosition(p.time) }));

  return (
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
        {pauseMarkers.map((p) => (
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
    </div>
  );
};
