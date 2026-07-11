export default function CompareLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-slate-800 rounded-lg" />
      <div className="h-4 w-64 bg-slate-800 rounded-lg" />
      <div className="bg-[#111115] border border-slate-800 rounded-2xl p-4">
        <div className="h-12 bg-slate-800 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111115] border border-slate-800 rounded-2xl h-80" />
        <div className="bg-[#111115] border border-slate-800 rounded-2xl h-80" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111115] border border-slate-800 rounded-2xl h-64" />
        <div className="bg-[#111115] border border-slate-800 rounded-2xl h-64" />
      </div>
    </div>
  );
}
