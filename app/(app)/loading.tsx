import { Spinner } from "@/components/ui/spinner";

export default function AppLoading() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-text-muted text-sm">Chargement...</p>
      </div>
    </div>
  );
}
