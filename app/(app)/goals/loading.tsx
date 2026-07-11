function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`bg-slate-800/50 animate-pulse rounded-lg ${className}`} />;
}

export default function GoalsLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="h-12 w-12 rounded-xl" />
        <div>
          <SkeletonBlock className="h-8 w-48" />
          <SkeletonBlock className="h-4 w-72 mt-1" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#111115] border border-slate-800 rounded-2xl p-6">
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="h-8 w-12 mt-3" />
            <SkeletonBlock className="h-3 w-28 mt-2" />
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-[#111115] to-[#0a0a0c] border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <SkeletonBlock className="h-5 w-32" />
          <SkeletonBlock className="h-9 w-28 rounded-xl" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-800/30 rounded-xl p-4 mb-3">
            <div className="flex items-center gap-3 mb-3">
              <SkeletonBlock className="h-5 w-5 rounded" />
              <SkeletonBlock className="flex-1 h-4" />
              <SkeletonBlock className="h-4 w-16" />
            </div>
            <SkeletonBlock className="h-2 w-full rounded-full" />
            <div className="flex justify-between mt-1">
              <SkeletonBlock className="h-3 w-20" />
              <SkeletonBlock className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#111115] border border-slate-800 rounded-2xl p-6">
        <SkeletonBlock className="h-5 w-40 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-800/30 rounded-xl p-4 text-center">
              <SkeletonBlock className="h-8 w-8 rounded-full mx-auto" />
              <SkeletonBlock className="h-4 w-16 mx-auto mt-2" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#111115] border border-slate-800 rounded-2xl p-6">
        <SkeletonBlock className="h-5 w-36 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-slate-800/30 rounded-xl p-4">
              <SkeletonBlock className="h-4 w-24 mb-2" />
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-3/4 mt-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
