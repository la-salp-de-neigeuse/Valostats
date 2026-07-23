import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function ProfileStatsLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Hero skeleton */}
      <div className="rounded-2xl bg-slate-800/30 border border-slate-800 p-8">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>

      {/* Player info skeleton */}
      <div className="rounded-2xl bg-slate-800/30 border border-slate-800 p-7">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-slate-800/50 animate-pulse shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-32 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Global stats skeleton */}
      <div className="rounded-xl bg-slate-800/30 border border-slate-800 p-6">
        <Skeleton className="h-5 w-44 mb-5" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>

      {/* Agents + Maps skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-xl bg-slate-800/30 border border-slate-800 p-6">
          <Skeleton className="h-5 w-20 mb-5" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/20">
                <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="text-right space-y-1">
                  <Skeleton className="h-4 w-10 ml-auto" />
                  <Skeleton className="h-3 w-14 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-slate-800/30 border border-slate-800 p-6">
          <Skeleton className="h-5 w-16 mb-5" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/20">
                <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="text-right space-y-1">
                  <Skeleton className="h-4 w-10 ml-auto" />
                  <Skeleton className="h-3 w-14 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
