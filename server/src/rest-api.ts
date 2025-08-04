import dotenv from "dotenv";
import express, { RequestHandler } from "express";
import cors from "cors";
import { UrlController } from './controllers/urlController';
import { initializeCache } from './config/cache';
import { requestLogger } from './middleware/requestLogger';
import logger from './config/logger';

dotenv.config();
initializeCache();

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

const urlController = new UrlController();

app.post("/api/urls", urlController.createUrl as RequestHandler);
app.get("/api/urls", urlController.getUrls as RequestHandler);
app.get("/api/urls/:id", urlController.getUrl as RequestHandler);
app.get("/:shortCode", urlController.handleRedirect as RequestHandler);
app.delete("/api/urls/:id", urlController.deleteUrl as RequestHandler);

app.get("/", ((_req, res) => {
  res.json({ status: "healthy", "client-default-port": 3000 });
}) as RequestHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});