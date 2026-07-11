import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthSessionProvider } from "@/components/auth/session-provider";
import { ToastProvider } from "@/components/ui/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://valostats.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "ValoStats",
    template: "%s | ValoStats",
  },
  description: "Analysez et améliorez vos performances sur Valorant. Suivi KDA, winrate, coach IA, overlay stream, classement et plus encore.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "ValoStats",
    title: "ValoStats",
    description: "Analysez et améliorez vos performances sur Valorant. Suivi KDA, winrate, coach IA, overlay stream, classement et plus encore.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ValoStats",
    description: "Analysez et améliorez vos performances sur Valorant. Suivi KDA, winrate, coach IA, overlay stream, classement et plus encore.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-rose-500 focus:text-white focus:rounded-xl focus:text-sm focus:font-semibold"
        >
          Aller au contenu principal
        </a>
        <AuthSessionProvider><ToastProvider>{children}</ToastProvider></AuthSessionProvider>
      </body>
    </html>
  );
}
