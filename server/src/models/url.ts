export interface UrlEntity {
  id: string;
  original_url: string;
  short_code: string;
  custom_slug: string | null;
  expiration_date: string | null;
  utm_parameters: Record<string, string> | null;
  click_count: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUrlDto {
  original_url: string;
  custom_slug?: string;
  expiration_date?: string;
  utm_parameters?: Record<string, string>;
}

export interface UrlResponse extends UrlEntity {
  short_url: string;
  is_expired?: boolean;
}

export interface UrlCacheEntry {
  id: string;
  original_url: string;
  expiration_date: string | null;
  utm_parameters: Record<string, string> | null;
  lastAccessed: number;
}