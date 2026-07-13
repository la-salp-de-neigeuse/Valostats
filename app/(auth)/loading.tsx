import { Spinner } from "@/components/ui/spinner";

export default function AuthLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-text-muted text-sm">Chargement...</p>
    </div>
  );
}
