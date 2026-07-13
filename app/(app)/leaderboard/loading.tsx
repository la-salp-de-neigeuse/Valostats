function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`bg-slate-800/50 animate-pulse rounded-lg ${className}`} />;
}

export default function LeaderboardLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-12 w-12 rounded-xl" />
          <div>
            <SkeletonBlock className="h-8 w-52" />
            <SkeletonBlock className="h-4 w-64 mt-1" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonBlock key={i} className="h-9 w-20 rounded-lg" />
        ))}
      </div>

      <div className="bg-surface border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonBlock key={i} className="h-4 flex-1" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-slate-800/50">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="px-6 py-4">
              <div className="flex items-center gap-4">
                <SkeletonBlock className="h-5 w-8" />
                <SkeletonBlock className="h-8 w-8 rounded-full" />
                <SkeletonBlock className="h-4 w-32 flex-1" />
                <SkeletonBlock className="h-4 w-16" />
                <SkeletonBlock className="h-4 w-16" />
                <SkeletonBlock className="h-4 w-12" />
                <SkeletonBlock className="h-4 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
