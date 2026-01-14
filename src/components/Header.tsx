
import React from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, children }) => (
  <header className="app-header fade-in-scale shadow-soft">
    <div className="brand">
      <span className="icon animate-fade-in-up" aria-label="Logo" style={{fontFamily:'monospace',fontWeight:900}}>⏰</span>
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-primary mb-1 animate-fade-in-up">{title}</h1>
        {subtitle && <div className="muted text-sm animate-fade-in-up">{subtitle}</div>}
      </div>
    </div>
    <nav className="controls">{children}</nav>
  </header>
);
