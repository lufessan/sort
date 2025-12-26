import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import axios from "axios";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Proxy for M3U fetching to avoid CORS issues
  app.get("/api/proxy-m3u", async (req, res) => {
    const url = req.query.url as string;
    if (!url) return res.status(400).send("URL is required");
    console.log(`Proxying request for: ${url}`);
    try {
      const response = await axios.get(url, { 
        responseType: "text",
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000 
      });
      console.log(`Success fetching ${url}, length: ${response.data.length}`);
      res.send(response.data);
    } catch (error: any) {
      console.error(`Error fetching ${url}:`, error.message);
      res.status(500).send("Error fetching M3U");
    }
  });

  // Favorites API
  app.get(api.favorites.list.path, async (req, res) => {
    const favorites = await storage.getFavorites();
    res.json(favorites);
  });

  app.post(api.favorites.create.path, async (req, res) => {
    try {
      const input = api.favorites.create.input.parse(req.body);
      const favorite = await storage.createFavorite(input);
      res.status(201).json(favorite);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.favorites.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    await storage.deleteFavorite(id);
    res.status(204).end();
  });

  return httpServer;
}
