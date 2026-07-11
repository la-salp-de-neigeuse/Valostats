function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`bg-slate-800/50 animate-pulse rounded-lg ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <SkeletonBlock className="h-8 w-64" />
          <SkeletonBlock className="h-4 w-48 mt-2" />
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonBlock key={i} className="h-9 w-16 rounded-xl" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#111115] border border-slate-800 rounded-2xl p-6">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-8 w-16 mt-3" />
            <SkeletonBlock className="h-3 w-32 mt-2" />
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-[#111115] to-[#0a0a0c] border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <SkeletonBlock className="h-12 w-12 rounded-xl" />
          <div className="flex-1">
            <SkeletonBlock className="h-5 w-32" />
            <SkeletonBlock className="h-4 w-48 mt-1" />
          </div>
        </div>
        <div className="flex items-center gap-6 mt-4">
          <SkeletonBlock className="h-16 w-16" />
          <SkeletonBlock className="flex-1 h-3 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      <div className="bg-gradient-to-br from-[#111115] to-[#0a0a0c] border border-slate-800 rounded-2xl p-6">
        <SkeletonBlock className="h-6 w-24 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-800/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <SkeletonBlock className="h-2 w-2 rounded-full" />
                <SkeletonBlock className="h-4 w-24" />
              </div>
              <SkeletonBlock className="h-32 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#111115] border border-slate-800 rounded-2xl p-6">
            <SkeletonBlock className="h-4 w-24 mb-3" />
            <SkeletonBlock className="h-8 w-20 mb-1" />
            <SkeletonBlock className="h-3 w-36" />
          </div>
        ))}
      </div>
    </div>
  );
}
