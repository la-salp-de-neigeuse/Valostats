import type { DataSource } from "@/lib/cache/cache-service";

export interface NewsArticle {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  url: string;
  publishedAt: string;
  category: string;
  tags: string[];
  source: DataSource;
}
