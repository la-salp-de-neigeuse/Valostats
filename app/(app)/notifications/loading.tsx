function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`bg-slate-800/50 animate-pulse rounded-lg ${className}`} />;
}

export default function NotificationsLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="h-12 w-12 rounded-xl" />
        <div>
          <SkeletonBlock className="h-8 w-48" />
          <SkeletonBlock className="h-4 w-48 mt-1" />
        </div>
      </div>

      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonBlock key={i} className="h-8 w-24 rounded-lg" />
        ))}
      </div>

      <div className="bg-[#111115] border border-slate-800 rounded-2xl p-4 space-y-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start gap-3 p-3">
            <SkeletonBlock className="h-10 w-10 rounded-xl shrink-0" />
            <div className="flex-1">
              <SkeletonBlock className="h-4 w-3/4" />
              <SkeletonBlock className="h-3 w-1/2 mt-2" />
            </div>
            <SkeletonBlock className="h-3 w-16 mt-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
