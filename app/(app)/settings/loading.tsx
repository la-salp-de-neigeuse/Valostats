export default function SettingsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-slate-800 rounded-lg" />
      <div className="h-4 w-72 bg-slate-800 rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-surface border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="h-5 w-32 bg-slate-800 rounded-lg" />
            <div className="h-10 bg-slate-800 rounded-lg" />
            <div className="h-10 bg-slate-800 rounded-lg" />
            <div className="h-10 bg-slate-800 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
