function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`bg-slate-800/50 animate-pulse rounded-lg ${className}`} />;
}

export default function MatchesLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <SkeletonBlock className="h-8 w-72" />
        <SkeletonBlock className="h-4 w-56 mt-2" />
      </div>

      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl px-4 py-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <SkeletonBlock className="h-4 w-64" />
          <SkeletonBlock className="h-4 w-48" />
        </div>
      </div>

      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-[#111115] border border-slate-800 rounded-xl p-4"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <SkeletonBlock className="h-4 w-4 rounded" />
                  <SkeletonBlock className="h-4 w-24" />
                  <SkeletonBlock className="h-4 w-20" />
                </div>
                <div className="flex items-center gap-4">
                  <SkeletonBlock className="h-8 w-8 rounded-full" />
                  <div className="flex items-center gap-1">
                    <SkeletonBlock className="h-6 w-6" />
                    <span className="text-slate-600 text-sm">/</span>
                    <SkeletonBlock className="h-6 w-6" />
                    <span className="text-slate-600 text-sm">/</span>
                    <SkeletonBlock className="h-6 w-6" />
                  </div>
                  <SkeletonBlock className="h-5 w-16 rounded" />
                </div>
              </div>
              <div className="text-right">
                <SkeletonBlock className="h-4 w-24 ml-auto" />
                <SkeletonBlock className="h-3 w-16 ml-auto mt-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
