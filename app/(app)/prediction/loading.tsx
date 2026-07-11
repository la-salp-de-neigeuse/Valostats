function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`bg-slate-800/50 animate-pulse rounded-lg ${className}`} />;
}

export default function PredictionLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="h-12 w-12 rounded-xl" />
        <div>
          <SkeletonBlock className="h-8 w-48" />
          <SkeletonBlock className="h-4 w-64 mt-1" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#111115] to-[#0a0a0c] border border-slate-800 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <SkeletonBlock className="h-5 w-32" />
            <SkeletonBlock className="h-4 w-48 mt-1" />
          </div>
          <SkeletonBlock className="h-16 w-16 rounded-full" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-800/30 rounded-xl p-4">
              <SkeletonBlock className="h-3 w-16" />
              <SkeletonBlock className="h-6 w-20 mt-2" />
              <SkeletonBlock className="h-3 w-24 mt-1" />
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <SkeletonBlock className="h-3 w-full rounded-full" />
          <SkeletonBlock className="h-3 w-3/4 rounded-full" />
          <SkeletonBlock className="h-3 w-5/6 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-[#111115] border border-slate-800 rounded-2xl p-6">
            <SkeletonBlock className="h-5 w-32 mb-4" />
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex items-center gap-3 mb-3">
                <SkeletonBlock className="h-8 w-8 rounded-lg shrink-0" />
                <SkeletonBlock className="flex-1 h-4" />
                <SkeletonBlock className="h-4 w-12" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
