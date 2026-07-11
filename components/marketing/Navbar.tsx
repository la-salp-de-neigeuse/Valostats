"use client";

import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-white tracking-wider">
              VALO<span className="text-rose-500">STATS</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">
              Fonctionnalités
            </Link>
            <Link href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors">
              Tarifs
            </Link>
            <Link href="#cta" className="text-sm text-slate-400 hover:text-white transition-colors">
              Commencer
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-4 py-2"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl transition-colors shadow-lg shadow-rose-500/20"
            >
              Créer un compte
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
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
          <div className="md:hidden pb-4 space-y-2">
            <Link href="#features" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm text-slate-400 hover:text-white rounded-lg">
              Fonctionnalités
            </Link>
            <Link href="#pricing" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm text-slate-400 hover:text-white rounded-lg">
              Tarifs
            </Link>
            <Link href="#cta" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm text-slate-400 hover:text-white rounded-lg">
              Commencer
            </Link>
            <div className="pt-2 flex flex-col gap-2">
              <Link href="/login" onClick={() => setOpen(false)} className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg">
                Connexion
              </Link>
              <Link href="/register" onClick={() => setOpen(false)} className="text-sm font-medium bg-rose-500 hover:bg-rose-600 text-white px-3 py-2 rounded-xl text-center">
                Créer un compte
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
