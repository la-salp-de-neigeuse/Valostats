export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      <p className="text-slate-400 text-sm">Chargement...</p>
    </div>
  );
}
