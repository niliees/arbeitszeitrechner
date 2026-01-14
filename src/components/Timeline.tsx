import React from "react";

interface TimelineItem {
	time: string;
	label: string;
	accent?: boolean;
}

interface TimelineProps {
	items: TimelineItem[];
}

export const Timeline: React.FC<TimelineProps> = ({ items }) => (
	<div className="timeline fade-in-scale">
		{items.map((item, idx) => (
			<div key={idx} className={`timeline-item animate-fade-in-up ${item.accent ? 'badge-accent' : ''}`}>
				<div className="flex items-center gap-4">
					<span className={`font-mono text-lg px-3 py-1 rounded-lg ${item.accent ? 'bg-accent text-black font-bold' : 'bg-bg-2 text-fg'}`}>{item.time}</span>
					<span className="text-fg text-base font-semibold">{item.label}</span>
				</div>
			</div>
		))}
	</div>
);
