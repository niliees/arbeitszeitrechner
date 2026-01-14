
import React from "react";

interface ToastProps {
  message: string;
}

export const Toast: React.FC<ToastProps> = ({ message }) => (
  <div className="toast fade-in-scale shadow-glow">
    <span className="message animate-fade-in-up">{message}</span>
  </div>
);
