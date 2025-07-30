import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import { db } from "./db/knex";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

interface UrlCacheEntry {
  id: string;
  original_url: string;
  expiration_date: string | null;
  lastAccessed: number;
}

const urlCache = new Map<string, UrlCacheEntry>();
const CACHE_TTL = 5 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of urlCache.entries()) {
    if (now - value.lastAccessed > CACHE_TTL) {
      urlCache.delete(key);
    }
  }
}, CACHE_TTL);

const generateShortCode = (length = 8): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isExpired = (expirationDate: string | null): boolean => {
  if (!expirationDate) return false;
  return new Date(expirationDate) < new Date();
};

const buildShortUrl = (shortCode: string): string => {
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 8000}`;
  return `${baseUrl}/${shortCode}`;
};

app.post("/api/urls", async (req: any, res: any) => {
  try {
    const { original_url, custom_slug, expiration_date, utm_parameters } = req.body;

    if (!original_url) {
      return res.status(400).json({ error: "original_url is required" });
    }

    if (!isValidUrl(original_url)) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    if (expiration_date && new Date(expiration_date) <= new Date()) {
      return res.status(400).json({ error: "Expiration date must be in the future" });
    }

    if (custom_slug) {
      const existingSlug = await db("urls")
        .where("custom_slug", custom_slug)
        .orWhere("short_code", custom_slug)
        .first();
      
      if (existingSlug) {
        return res.status(409).json({ error: "Custom slug is already taken" });
      }
    }

    let short_code: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      short_code = custom_slug || generateShortCode();
      const existing = await db("urls")
        .where("short_code", short_code)
        .orWhere("custom_slug", short_code)
        .first();
      
      if (!existing) break;
      
      if (custom_slug) {
        return res.status(409).json({ error: "Custom slug is already taken" });
      }
      
      attempts++;
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      return res.status(500).json({ error: "Unable to generate unique short code" });
    }

    const [url] = await db("urls")
      .insert({
        original_url,
        short_code,
        custom_slug: custom_slug || null,
        expiration_date: expiration_date || null,
        utm_parameters: utm_parameters || null,
      })
      .returning("*");

    const short_url = buildShortUrl(url.short_code);

    res.status(201).json({
      id: url.id,
      original_url: url.original_url,
      short_url,
      short_code: url.short_code,
      custom_slug: url.custom_slug,
      expiration_date: url.expiration_date,
      utm_parameters: url.utm_parameters,
      click_count: url.click_count,
      createdAt: url.createdAt,
    });

  } catch (error) {
    console.error("Error creating shortened URL:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/urls", async (req: any, res: any) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const urls = await db("urls")
      .select("*")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .offset(offset);

    const total = await db("urls").count("* as count").first();

    const urlsWithShortUrl = urls.map(url => ({
      ...url,
      short_url: buildShortUrl(url.short_code),
      is_expired: isExpired(url.expiration_date)
    }));

    res.json({
      urls: urlsWithShortUrl,
      pagination: {
        page,
        limit,
        total: parseInt(total?.count as string) || 0,
        pages: Math.ceil((parseInt(total?.count as string) || 0) / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching URLs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/urls/:id", async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const url = await db("urls")
      .where("id", id)
      .first();

    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    res.json({
      ...url,
      short_url: buildShortUrl(url.short_code),
      is_expired: isExpired(url.expiration_date)
    });

  } catch (error) {
    console.error("Error fetching URL:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/:shortCode", async (req: any, res: any) => {
  try {
    const { shortCode } = req.params;

    let urlData = urlCache.get(shortCode);

    if (!urlData) {
      const url = await db("urls")
        .where("short_code", shortCode)
        .orWhere("custom_slug", shortCode)
        .first();

      if (!url) {
        return res.status(404).json({ error: "Short URL not found" });
      }

      urlData = {
        id: url.id,
        original_url: url.original_url,
        expiration_date: url.expiration_date,
        lastAccessed: Date.now()
      };

      urlCache.set(shortCode, urlData);
    } else {
      urlData.lastAccessed = Date.now();
    }

    if (isExpired(urlData.expiration_date)) {
      return res.status(410).json({ error: "This short URL has expired" });
    }

    db("urls")
      .where("id", urlData.id)
      .increment("click_count", 1)
      .catch(err => console.error("Error updating click count:", err));

    res.redirect(302, urlData.original_url);

  } catch (error) {
    console.error("Error redirecting:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/urls/:id", async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const deleted = await db("urls")
      .where("id", id)
      .del();

    if (deleted === 0) {
      return res.status(404).json({ error: "URL not found" });
    }

    res.status(204).send();

  } catch (error) {
    console.error("Error deleting URL:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/", async (_req: any, res: any) => {
  res.json({ hello: "world", "client-default-port": 3000 });
});

app.get("/examples", async (_req: any, res: any) => {
  const docs = await db("example_foreign_table").select("*");
  res.json({ docs });
});

app.post("/examples", async (req: any, res: any) => {
  const { authMethod, name } = req.body;
  const [doc] = await db("example_foreign_table")
    .insert({
      authMethod,
      name,
    })
    .returning("*");
  res.json({ doc });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`server has started on port ${PORT}`);
});
