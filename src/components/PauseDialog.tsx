import React from "react";

interface PauseDialogProps {
  pauseTime: string;
  setPauseTime: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

export const PauseDialog: React.FC<PauseDialogProps> = ({ pauseTime, setPauseTime, onSave, onCancel, disabled }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
    <div className="card w-full max-w-xs z-10">
      <h3 className="font-bold mb-3">Pausenzeit eintragen</h3>
      <input type="time" value={pauseTime} onChange={e => setPauseTime(e.target.value)} className="w-full p-2 mono mb-3" />
      <div className="flex justify-end gap-2">
        <button className="btn btn-ghost" onClick={onCancel}>Abbrechen</button>
        <button className="btn btn-primary" onClick={onSave} disabled={disabled}>Speichern</button>
      </div>
    </div>
  </div>
);
