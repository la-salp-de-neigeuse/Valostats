export default function OverlaySettingsLoading() {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200">
      <div className="max-w-6xl mx-auto p-6 md:p-8 animate-pulse">
        <div className="h-8 w-48 bg-slate-800 rounded-lg mb-2" />
        <div className="h-4 w-96 bg-slate-800 rounded-lg mb-8" />
        <div className="grid xl:grid-cols-5 gap-8">
          <div className="xl:col-span-3 space-y-6">
            <div className="bg-[#111115] border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="h-4 w-32 bg-slate-800 rounded" />
              <div className="h-10 bg-slate-800 rounded-lg" />
              <div className="h-10 bg-slate-800 rounded-lg" />
            </div>
            <div className="bg-[#111115] border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="h-4 w-32 bg-slate-800 rounded" />
              <div className="h-32 bg-slate-800 rounded-lg" />
              <div className="h-8 bg-slate-800 rounded-lg w-32" />
            </div>
          </div>
          <div className="xl:col-span-2">
            <div className="bg-[#111115] border border-slate-800 rounded-2xl p-4 sticky top-8 space-y-3">
              <div className="h-4 w-24 bg-slate-800 rounded" />
              <div className="aspect-video bg-slate-800 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
