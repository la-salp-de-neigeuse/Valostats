export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-slate-800/50 rounded-lg animate-skeletal-shimmer ${className}`} />;
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-surface border border-border rounded-xl p-6 ${className}`}>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-16 mt-3" />
      <Skeleton className="h-3 w-32 mt-2" />
    </div>
  );
}

export function SkeletonLine({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
      <Skeleton className="flex-1 h-4" />
      <Skeleton className="h-4 w-12" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonLine key={i} />
      ))}
    </div>
  );
}

export function SkeletonChart({ className = "" }: { className?: string }) {
  return <Skeleton className={`h-48 w-full rounded-xl ${className}`} />;
}
