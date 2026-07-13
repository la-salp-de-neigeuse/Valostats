import type { ReactNode } from "react";

interface FieldGroupProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function FieldGroup({ label, children, className = "" }: FieldGroupProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-text-secondary">{label}</label>
      {children}
    </div>
  );
}
