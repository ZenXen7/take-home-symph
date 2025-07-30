import { z } from "zod";

export const utmParametersSchema = z.object({
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
});

export const urlFormSchema = z.object({
  original_url: z.string().min(1, "URL is required").url("Please enter a valid URL"),
  custom_slug: z.string().optional(),
  expiration_date: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
}).refine((data) => {
  if (data.expiration_date) {
    const expirationDate = new Date(data.expiration_date);
    const now = new Date();
    return expirationDate > now;
  }
  return true;
}, {
  message: "Expiration date must be in the future",
  path: ["expiration_date"],
});

export const shortenedUrlSchema = z.object({
  id: z.string(),
  original_url: z.string(),
  short_url: z.string(),
  short_code: z.string(),
  custom_slug: z.string().nullable(),
  expiration_date: z.string().nullable(),
  utm_parameters: z.any().nullable(),
  click_count: z.number(),
  createdAt: z.string(),
});

export const urlDataSchema = z.object({
  id: z.string(),
  original_url: z.string(),
  short_url: z.string(),
  short_code: z.string(),
  custom_slug: z.string().nullable(),
  expiration_date: z.string().nullable(),
  utm_parameters: z.any().nullable(),
  click_count: z.number(),
  createdAt: z.string(),
  is_expired: z.boolean(),
});

export const analyticsResponseSchema = z.object({
  urls: z.array(urlDataSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
  }),
});

export const analyticsSchema = z.object({
  totalUrls: z.number(),
  totalClicks: z.number(),
  avgClicksPerUrl: z.number(),
  expiredUrls: z.number(),
});

export const recentUrlsSchema = z.object({
  urls: z.array(urlDataSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
  }),
});

export type UrlFormData = z.infer<typeof urlFormSchema>;
export type ShortenedUrl = z.infer<typeof shortenedUrlSchema>;
export type UrlData = z.infer<typeof urlDataSchema>;
export type Analytics = z.infer<typeof analyticsSchema>; 