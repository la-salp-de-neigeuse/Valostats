import Link from "next/link";

interface LegalPageLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function LegalPageLayout({ title, description, children }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-brand-br flex items-center justify-center text-white font-bold text-xs shadow-glow">
              V
            </div>
            <span className="text-base font-bold text-text-primary">
              VALO<span className="text-accent">STATS</span>
            </span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Retour
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-text-primary">{title}</h1>
          <p className="text-text-secondary mt-2 leading-relaxed">{description}</p>
        </div>

        <div className="space-y-6">
          {children}
        </div>
      </main>

      <footer className="border-t border-border py-6">
        <p className="text-center text-xs text-text-muted">
          &copy; {new Date().getFullYear()} ValoStats. Tous droits réservés.
        </p>
      </footer>
    </div>
  );
}
