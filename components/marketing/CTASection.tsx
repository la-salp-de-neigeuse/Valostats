import Link from "next/link";

export function CTASection() {
  return (
    <section id="cta" className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-rose-500/10 to-transparent border border-rose-500/20 rounded-3xl p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Prêt à améliorer votre jeu ?
            </h2>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              Rejoignez ValoStats gratuitement et commencez à analyser vos performances 
              dès aujourd&apos;hui. Aucune carte bancaire requise.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-rose-500/25"
              >
                Créer un compte gratuit
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center text-slate-300 hover:text-white font-medium px-6 py-3 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"
              >
                J&apos;ai déjà un compte
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
