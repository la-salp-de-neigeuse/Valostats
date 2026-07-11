function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`bg-slate-800/50 animate-pulse rounded-lg ${className}`} />;
}

export default function AiCoachLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="h-12 w-12 rounded-xl" />
        <div>
          <SkeletonBlock className="h-8 w-48" />
          <SkeletonBlock className="h-4 w-72 mt-1" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-gradient-to-br from-[#111115] to-[#0a0a0c] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-start gap-4 mb-4">
            <SkeletonBlock className="h-12 w-12 rounded-xl" />
            <div className="flex-1">
              <SkeletonBlock className="h-5 w-32" />
              <SkeletonBlock className="h-4 w-48 mt-1" />
            </div>
          </div>
          <div className="flex items-center gap-6 mb-4">
            <SkeletonBlock className="h-16 w-16" />
            <SkeletonBlock className="flex-1 h-3 rounded-full" />
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4">
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-3/4 mt-2" />
          </div>
        </div>

        <div>
          <div className="bg-[#111115] border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <SkeletonBlock className="h-8 w-8 rounded-lg" />
              <SkeletonBlock className="h-5 w-28" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <SkeletonBlock className="h-3 w-20" />
                    <SkeletonBlock className="h-3 w-8" />
                  </div>
                  <SkeletonBlock className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-[#111115] border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <SkeletonBlock className="h-8 w-8 rounded-lg" />
            <SkeletonBlock className="h-5 w-28" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between">
                <SkeletonBlock className="h-4 w-20" />
                <SkeletonBlock className="h-4 w-16" />
              </div>
            ))}
            <div>
              <SkeletonBlock className="h-3 w-12 mb-2" />
              <div className="flex flex-wrap gap-1.5">
                {[1, 2, 3].map((j) => (
                  <SkeletonBlock key={j} className="h-5 w-20 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-[#111115] border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <SkeletonBlock className="h-8 w-8 rounded-lg" />
              <SkeletonBlock className="h-5 w-40" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#111115] border border-slate-800 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <SkeletonBlock className="h-4 w-40" />
                    <SkeletonBlock className="h-5 w-14 rounded-full" />
                  </div>
                  <SkeletonBlock className="h-3 w-full mb-3" />
                  <div className="flex items-center gap-4">
                    <SkeletonBlock className="h-3 w-16" />
                    <SkeletonBlock className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <SkeletonBlock className="h-7 w-48 mb-6" />
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <SkeletonBlock className="h-2 w-2 rounded-full" />
              <SkeletonBlock className="h-5 w-28" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-[#111115] border border-emerald-500/10 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <SkeletonBlock className="h-8 w-8 rounded-lg shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <SkeletonBlock className="h-3 w-12" />
                        <SkeletonBlock className="h-3 w-8" />
                      </div>
                      <SkeletonBlock className="h-4 w-40 mb-1" />
                      <SkeletonBlock className="h-3 w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
