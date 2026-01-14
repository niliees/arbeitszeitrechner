
import React from "react";

interface PauseDialogProps {
  pauseTime: string;
  setPauseTime: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

export const PauseDialog: React.FC<PauseDialogProps> = ({ pauseTime, setPauseTime, onSave, onCancel, disabled }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in-up">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
    <div className="card w-full max-w-sm z-10 shadow-soft fade-in-scale">
      <h3 className="font-bold mb-4 text-lg text-primary">Pause eintragen</h3>
      <input
        type="time"
        value={pauseTime}
        onChange={e => setPauseTime(e.target.value)}
        className="w-full p-3 rounded-lg bg-bg-2 text-fg font-mono mb-4 border border-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
      />
      <div className="flex justify-end gap-2">
        <button className="controls button bg-bg-2 text-muted border border-muted hover:bg-primary hover:text-white transition-all" onClick={onCancel}>Abbrechen</button>
        <button className="controls button bg-primary text-white" onClick={onSave} disabled={disabled} style={{opacity:disabled?0.6:1}}>Speichern</button>
      </div>
    </div>
  </div>
);
