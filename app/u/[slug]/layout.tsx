import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Profil Public | ValoStats",
  description: "Statistiques Valorant détaillées et analyses IA",
};

export default function PublicProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200">
      {children}
    </div>
  );
}
