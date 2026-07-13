'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS, ABOUT_ITEMS } from './nav-items'
import { Logo } from '@/components/ui/logo'

interface SidebarContextType {
  isOpen: boolean
  open: () => void
  close: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  return (
    <SidebarContext.Provider value={{ isOpen, open, close }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider')
  return ctx
}

const STORAGE_KEY = "sidebar:about:expanded";

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function MobileDrawer() {
  const { isOpen, close } = useSidebar()
  const pathname = usePathname()
  const drawerRef = useRef<HTMLDivElement>(null)
  const [aboutOpen, setAboutOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY) === "true";
    }
    return false;
  })

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') close()
    },
    [close],
  )

  useEffect(() => {
    close()
  }, [pathname, close])

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !drawerRef.current) return
    const firstFocusable = drawerRef.current.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    firstFocusable?.focus()
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !drawerRef.current) return
      const focusable = drawerRef.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [isOpen])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(aboutOpen));
  }, [aboutOpen]);

  const isAboutActive = ABOUT_ITEMS.some((item) => pathname === item.href || pathname.startsWith(item.href + "/"));

  return (
    <div
      className={`fixed inset-0 z-50 md:hidden ${
        isOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      role="presentation"
    >
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={close}
        aria-hidden="true"
      />

      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation mobile"
        onKeyDown={handleKeyDown}
        className={`relative w-64 h-full bg-background border-r border-border transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Logo size={28} textClassName="text-lg" />
          <button
            onClick={close}
            className="text-text-muted hover:text-text-primary p-1 transition-colors"
            aria-label="Fermer le menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-5rem)]" aria-label="Navigation principale">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'text-accent bg-accent-light'
                    : 'text-text-muted hover:text-text-secondary hover:bg-surface-hover/50'
                }`}
                aria-current={isActive ? 'page' : undefined}
                onClick={close}
              >
                <item.icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            )
          })}

          {/* À propos dropdown */}
          <div className="pt-2">
            <button
              onClick={() => setAboutOpen((prev) => !prev)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isAboutActive
                  ? 'text-accent bg-accent-light'
                  : 'text-text-muted hover:text-text-secondary hover:bg-surface-hover/50'
              }`}
              aria-expanded={aboutOpen}
            >
              <svg aria-hidden="true" className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>À propos</span>
              <ChevronIcon className={`w-4 h-4 ml-auto transition-transform duration-200 ${aboutOpen ? "rotate-180" : ""}`} />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                aboutOpen ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"
              }`}
            >
              <div className="ml-2 space-y-0.5 border-l border-border pl-3">
                {ABOUT_ITEMS.map((item) => {
                  const isItemActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all ${
                        isItemActive
                          ? 'text-accent bg-accent-light/50'
                          : 'text-text-muted hover:text-text-secondary hover:bg-surface-hover/30'
                      }`}
                      aria-current={isItemActive ? 'page' : undefined}
                      onClick={close}
                    >
                      <span className="w-1 h-1 rounded-full bg-current shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  )
}
