import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="border-t border-slate-800/50 mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
        <p>&copy; {new Date().getFullYear()} ValoStats.</p>
        <div className="flex items-center gap-4">
          <Link href="/mentions-legales" className="hover:text-slate-400 transition-colors">Mentions légales</Link>
          <Link href="/cgu" className="hover:text-slate-400 transition-colors">CGU</Link>
          <Link href="/confidentialite" className="hover:text-slate-400 transition-colors">Confidentialité</Link>
        </div>
      </div>
    </footer>
  );
}
