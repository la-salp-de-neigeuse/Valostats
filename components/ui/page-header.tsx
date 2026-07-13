import type { ReactNode } from "react";

interface PageHeaderProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ icon, title, description, action, className = "" }: PageHeaderProps) {
  return (
    <div className={`flex items-center justify-between flex-wrap gap-4 ${className}`}>
      <div className="flex items-center gap-4">
        {icon && (
          <div className="p-2.5 bg-accent-light rounded-xl text-accent shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">{title}</h1>
          {description && <p className="text-sm text-text-muted mt-1">{description}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
