"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 40); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border" : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-brand-br flex items-center justify-center text-white font-bold text-xs shadow-glow transition-transform duration-200 group-hover:scale-110">
              V
            </div>
            <span className="text-lg font-bold tracking-wider text-text-primary">
              VALO<span className="text-accent">STATS</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-text-muted hover:text-text-primary transition-colors">
              Fonctionnalités
            </Link>
            <Link href="#overview" className="text-sm text-text-muted hover:text-text-primary transition-colors">
              Aperçu
            </Link>
            <Link href="#pricing" className="text-sm text-text-muted hover:text-text-primary transition-colors">
              Tarifs
            </Link>
            <Link href="#faq" className="text-sm text-text-muted hover:text-text-primary transition-colors">
              FAQ
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors px-4 py-2"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-accent hover:bg-accent-hover text-white px-5 py-2 rounded-xl transition-all duration-200 shadow-glow"
            >
              Créer un compte
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-text-muted hover:text-text-primary"
            aria-label="Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {open ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 space-y-1">
            <Link href="#features" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm text-text-muted hover:text-text-primary rounded-lg">Fonctionnalités</Link>
            <Link href="#overview" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm text-text-muted hover:text-text-primary rounded-lg">Aperçu</Link>
            <Link href="#pricing" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm text-text-muted hover:text-text-primary rounded-lg">Tarifs</Link>
            <Link href="#faq" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm text-text-muted hover:text-text-primary rounded-lg">FAQ</Link>
            <div className="pt-3 flex flex-col gap-2">
              <Link href="/login" onClick={() => setOpen(false)} className="text-sm font-medium text-text-secondary hover:text-text-primary px-3 py-2 rounded-lg">Connexion</Link>
              <Link href="/register" onClick={() => setOpen(false)} className="text-sm font-semibold bg-accent hover:bg-accent-hover text-white px-3 py-2 rounded-xl text-center">Créer un compte</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
