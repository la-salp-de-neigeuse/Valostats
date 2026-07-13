function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`bg-slate-800/50 animate-pulse rounded-lg ${className}`} />;
}

export default function ProfileLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <SkeletonBlock className="h-8 w-48" />
        <SkeletonBlock className="h-4 w-72 mt-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <div className="bg-surface border border-slate-800 rounded-2xl p-6">
          <SkeletonBlock className="h-6 w-32 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <SkeletonBlock className="h-3 w-20 mb-1" />
                <SkeletonBlock className="h-5 w-full" />
              </div>
            ))}
          </div>
          <SkeletonBlock className="h-10 w-full rounded-xl mt-6" />
        </div>

        <div className="bg-surface border border-slate-800 rounded-2xl p-6">
          <SkeletonBlock className="h-6 w-44 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <SkeletonBlock className="h-4 w-28" />
                <SkeletonBlock className="h-5 w-20 rounded-full" />
              </div>
            ))}
          </div>
          <SkeletonBlock className="h-10 w-full rounded-xl mt-6" />
        </div>
      </div>
    </div>
  );
}
