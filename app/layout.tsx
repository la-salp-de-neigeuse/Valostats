import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthSessionProvider } from "@/components/auth/session-provider";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AuroraBackground } from "@/components/ui/aurora-background";

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
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#070A12" },
    { media: "(prefers-color-scheme: light)", color: "#F8FAFC" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-theme="dark" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem("theme");
                if (!t || !["dark","light","midnight"].includes(t)) t = "dark";
                document.documentElement.setAttribute("data-theme", t);
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded-xl focus:text-sm focus:font-semibold"
        >
          Aller au contenu principal
        </a>
        <ThemeProvider>
          <AuroraBackground />
          <div className="relative z-10 flex-1 flex flex-col">
            <AuthSessionProvider><ToastProvider>{children}</ToastProvider></AuthSessionProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
