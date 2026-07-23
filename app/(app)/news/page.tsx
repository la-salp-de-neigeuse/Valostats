import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getNewsArticles } from "@/services/news/news-service";
import { NewsCard } from "@/components/news/NewsCard";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Actualités",
  description: "Toute l'actualité de Valorant : patch notes, annonces, esport et plus.",
};

export default async function NewsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const articles = await getNewsArticles();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <PageHeader
        icon={
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V6" />
            <path d="M12 7h4" />
            <path d="M12 11h4" />
            <path d="M8 15h8" />
          </svg>
        }
        title="Actualités"
        description="Toute l'actualité de Valorant : patch notes, annonces, esport et plus."
      />

      {articles.length === 0 ? (
        <EmptyState
          title="Aucune actualité disponible"
          description="Les actualités Valorant seront bientôt disponibles. Revenez plus tard."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
