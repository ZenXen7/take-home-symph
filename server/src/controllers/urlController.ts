import { Request, Response } from 'express';
import { UrlService } from '../services/urlService';

export class UrlController {
  private service: UrlService;

  constructor() {
    this.service = new UrlService();
  }

  createUrl = async (req: Request, res: Response) => {
    try {
      const url = await this.service.createUrl(req.body);
      res.status(201).json(url);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      res.status(error instanceof Error ? 400 : 500).json({ error: message });
    }
  };

  getUrls = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await this.service.getUrls(page, limit);
      res.json(result);
    } catch (error) {
      console.error('Error fetching URLs:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getUrl = async (req: Request, res: Response) => {
    try {
      const url = await this.service.getUrl(req.params.id);
      res.json(url);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      res.status(error instanceof Error ? 404 : 500).json({ error: message });
    }
  };

  handleRedirect = async (req: Request, res: Response) => {
    try {
      const { redirectUrl, isExpired } = await this.service.handleRedirect(req.params.shortCode);
      
      if (isExpired) {
        return res.status(410).json({ error: 'This short URL has expired' });
      }

      res.redirect(302, redirectUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      res.status(error instanceof Error ? 404 : 500).json({ error: message });
    }
  };

  deleteUrl = async (req: Request, res: Response) => {
    try {
      const deleted = await this.service.deleteUrl(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'URL not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting URL:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}