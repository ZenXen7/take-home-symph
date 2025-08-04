import { UrlRepository } from '../repositories/urlRepository';
import { CreateUrlDto, UrlResponse, UrlCacheEntry } from '../models/url';
import { urlCache } from '../config/cache';
import { generateShortCode, isValidUrl, isExpired, buildShortUrl } from '../utils/urlUtils';
import logger from '../config/logger';

export class UrlService {
  private repository: UrlRepository;
  private readonly maxAttempts = 10;

  constructor() {
    this.repository = new UrlRepository();
  }

  async createUrl(data: CreateUrlDto): Promise<UrlResponse> {
    if (!isValidUrl(data.original_url)) {
      logger.warn('Invalid URL format attempted', { url: data.original_url });
      throw new Error('Invalid URL format');
    }

    if (data.expiration_date && new Date(data.expiration_date) <= new Date()) {
      logger.warn('Invalid expiration date attempted', { expiration_date: data.expiration_date });
      throw new Error('Expiration date must be in the future');
    }

    if (data.custom_slug) {
      const exists = await this.repository.checkSlugExists(data.custom_slug);
      if (exists) {
        logger.warn('Duplicate custom slug attempted', { slug: data.custom_slug });
        throw new Error('Custom slug is already taken');
      }
    }

    let short_code: string;
    let attempts = 0;

    do {
      short_code = data.custom_slug || generateShortCode();
      const exists = await this.repository.checkSlugExists(short_code);
      if (!exists) break;
      if (data.custom_slug) {
        throw new Error('Custom slug is already taken');
      }
      attempts++;
    } while (attempts < this.maxAttempts);

    if (attempts >= this.maxAttempts) {
      logger.error('Failed to generate unique short code after maximum attempts');
      throw new Error('Unable to generate unique short code');
    }

    const url = await this.repository.create({
      ...data,
      custom_slug: data.custom_slug || undefined,
    });

    logger.info('URL shortened successfully', { 
      original_url: data.original_url,
      short_code: url.short_code,
      custom_slug: url.custom_slug 
    });

    return this.formatUrlResponse(url);
  }

  async getUrls(page: number = 1, limit: number = 10): Promise<{ urls: UrlResponse[]; pagination: any }> {
    const { urls, total } = await this.repository.findAll(page, limit);
    
    return {
      urls: urls.map(url => this.formatUrlResponse(url)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getUrl(id: string): Promise<UrlResponse> {
    const url = await this.repository.findById(id);
    if (!url) {
      logger.warn('URL not found', { id });
      throw new Error('URL not found');
    }
    return this.formatUrlResponse(url);
  }

  async handleRedirect(shortCode: string): Promise<{ redirectUrl: string; isExpired: boolean }> {
    let urlData = urlCache.get(shortCode);

    if (!urlData) {
      const url = await this.repository.findByShortCode(shortCode);
      if (!url) {
        logger.warn('Short URL not found', { shortCode });
        throw new Error('Short URL not found');
      }

      urlData = {
        id: url.id,
        original_url: url.original_url,
        expiration_date: url.expiration_date,
        utm_parameters: url.utm_parameters,
        lastAccessed: Date.now()
      };

      urlCache.set(shortCode, urlData);
      logger.debug('URL cache miss and updated', { shortCode });
    } else {
      urlData.lastAccessed = Date.now();
      logger.debug('URL cache hit', { shortCode });
    }

    if (isExpired(urlData.expiration_date)) {
      logger.info('Expired URL accessed', { shortCode });
      return { redirectUrl: '', isExpired: true };
    }

    this.repository.incrementClickCount(urlData.id).catch(error => {
      logger.error('Failed to increment click count', { 
        shortCode, 
        error: error.message 
      });
    });

    let redirectUrl = urlData.original_url;
    
    if (urlData.utm_parameters && Object.keys(urlData.utm_parameters).length > 0) {
      const url = new URL(urlData.original_url);
      Object.entries(urlData.utm_parameters).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
      redirectUrl = url.toString();
    }

    logger.info('URL redirect processed', { 
      shortCode,
      original_url: urlData.original_url 
    });

    return { redirectUrl, isExpired: false };
  }

  async deleteUrl(id: string): Promise<boolean> {
    const deleted = await this.repository.delete(id);
    if (deleted) {
      logger.info('URL deleted', { id });
    } else {
      logger.warn('Attempted to delete non-existent URL', { id });
    }
    return deleted;
  }

  private formatUrlResponse(url: any): UrlResponse {
    return {
      ...url,
      short_url: buildShortUrl(url.short_code),
      is_expired: isExpired(url.expiration_date)
    };
  }
}