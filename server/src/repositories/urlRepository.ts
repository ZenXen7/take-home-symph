import { db } from '../db/knex';
import { UrlEntity, CreateUrlDto } from '../models/url';

export class UrlRepository {
  async create(data: CreateUrlDto): Promise<UrlEntity> {
    const [url] = await db('urls')
      .insert({
        original_url: data.original_url,
        short_code: data.custom_slug || undefined,
        custom_slug: data.custom_slug || null,
        expiration_date: data.expiration_date || null,
        utm_parameters: data.utm_parameters || null,
      })
      .returning('*');
    return url;
  }

  async findByShortCode(shortCode: string): Promise<UrlEntity | null> {
    const url = await db('urls')
      .where('short_code', shortCode)
      .orWhere('custom_slug', shortCode)
      .first();
    return url || null;
  }

  async findById(id: string): Promise<UrlEntity | null> {
    const url = await db('urls')
      .where('id', id)
      .first();
    return url || null;
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ urls: UrlEntity[]; total: number }> {
    const offset = (page - 1) * limit;
    const urls = await db('urls')
      .select('*')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db('urls').count('* as count');
    return { urls, total: parseInt(count as string) || 0 };
  }

  async incrementClickCount(id: string): Promise<void> {
    await db('urls')
      .where('id', id)
      .increment('click_count', 1);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await db('urls')
      .where('id', id)
      .del();
    return deleted > 0;
  }

  async checkSlugExists(slug: string): Promise<boolean> {
    const existing = await db('urls')
      .where('custom_slug', slug)
      .orWhere('short_code', slug)
      .first();
    return !!existing;
  }
}