import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-text-muted">
        <p>&copy; {new Date().getFullYear()} ValoStats.</p>
        <div className="flex items-center gap-4">
          <Link href="/mentions-legales" className="hover:text-text-secondary transition-colors">Mentions légales</Link>
          <Link href="/cgu" className="hover:text-text-secondary transition-colors">CGU</Link>
          <Link href="/confidentialite" className="hover:text-text-secondary transition-colors">Confidentialité</Link>
        </div>
      </div>
    </footer>
  );
}
