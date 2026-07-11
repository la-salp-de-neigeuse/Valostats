export type SearchCategory = "pages" | "joueurs" | "equipes" | "matchs" | "notifications" | "objectifs";

export interface SearchResult {
  id: string;
  category: SearchCategory;
  label: string;
  description: string;
  href: string;
  badge?: string;
  icon?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
}

export interface SearchQuery {
  q: string;
  limit?: number;
}
