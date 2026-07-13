export default function OverlayLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse text-slate-600 text-sm">{"Chargement de l'overlay..."}</div>
    </div>
  );
}

