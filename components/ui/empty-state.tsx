import Link from "next/link";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; href: string };
  compact?: boolean;
}

export function EmptyState({ icon, title, description, action, compact }: EmptyStateProps) {
  return (
    <div className={`bg-surface border border-border rounded-xl ${compact ? "p-8 max-w-lg mx-auto" : "p-12"} text-center relative overflow-hidden`}>
      {icon && <div className="flex justify-center mb-4 text-text-muted">{icon}</div>}
      <h3 className={`font-bold text-text-primary ${compact ? "text-lg" : "text-xl"}`}>{title}</h3>
      <p className="text-text-secondary mt-2 leading-relaxed max-w-md mx-auto">{description}</p>
      {action && (
        <Link href={action.href} className="inline-flex mt-6">
          <Button variant="primary" size="lg">{action.label}</Button>
        </Link>
      )}
    </div>
  );
}
