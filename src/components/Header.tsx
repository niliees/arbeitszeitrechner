import React from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, children }) => (
  <div className="app-header mb-6">
    <div className="brand">
      <div className="logo">AZ</div>
      <div>
        <h1 className="text-2xl font-extrabold">{title}</h1>
        {subtitle && <div className="muted text-sm">{subtitle}</div>}
      </div>
    </div>
    <div className="controls">{children}</div>
  </div>
);
