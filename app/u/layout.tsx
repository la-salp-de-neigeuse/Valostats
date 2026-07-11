import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://valostats.app";

export const metadata: Metadata = {
  robots: { index: true, follow: true },
  alternates: { canonical: baseUrl },
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return children;
}
