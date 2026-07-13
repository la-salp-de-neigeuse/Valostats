export default function PerformanceLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-slate-800 rounded-lg" />
      <div className="h-4 w-72 bg-slate-800 rounded-lg" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-surface border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="h-3 w-16 bg-slate-800 rounded" />
            <div className="h-7 w-20 bg-slate-800 rounded" />
            <div className="h-3 w-12 bg-slate-800 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-surface border border-slate-800 rounded-2xl h-80" />
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-surface border border-slate-800 rounded-2xl h-48" />
          <div className="bg-surface border border-slate-800 rounded-2xl h-48" />
        </div>
      </div>
    </div>
  );
}
