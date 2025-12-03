// src/routes/articleRoutes.js
import express from "express";
import { authRequired } from "../middleware/authMiddleware.js";

export function createArticleRouter(db) {
  const router = express.Router();

  // GET /api/articles - list all
  router.get("/", async (_req, res) => {
    try {
      const rows = await db.all(`
        SELECT a.id,
               a.url,
               a.title,
               a.created_at,
               u.username,
               u.id AS user_id,
               u.role AS user_role
        FROM articles a
        JOIN users u ON a.user_id = u.id
        ORDER BY a.created_at DESC
      `);
      res.json(rows);
    } catch (err) {
      console.error("Error fetching articles:", err);
      res.status(500).json({ error: "Failed to fetch articles" });
    }
  });

  // POST /api/articles - create new (auth required)
  router.post("/", authRequired, async (req, res) => {
    const { url, title } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // basic URL validation
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: "Invalid URL" });
    }

    try {
      const result = await db.run(
        "INSERT INTO articles (url, title, user_id) VALUES (?, ?, ?)",
        url,
        title || null,
        req.user.id
      );

      const inserted = await db.get(
        `
        SELECT a.id,
               a.url,
               a.title,
               a.created_at,
               u.username,
               u.id AS user_id
        FROM articles a
        JOIN users u ON a.user_id = u.id
        WHERE a.id = ?
      `,
        result.lastID
      );

      res.status(201).json(inserted);
    } catch (err) {
      console.error("Error inserting article:", err);
      res.status(500).json({ error: "Failed to create article" });
    }
  });

  // DELETE /api/articles/:id - owner or admin can delete
  router.delete("/:id", authRequired, async (req, res) => {
    const articleId = req.params.id;

    try {
      const article = await db.get(
        "SELECT * FROM articles WHERE id = ?",
        articleId
      );

      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }

      const isOwner = article.user_id === req.user.id;
      const isAdmin = req.user.role === "admin";

      if (!isOwner && !isAdmin) {
        return res
          .status(403)
          .json({ error: "You are not allowed to delete this article" });
      }

      await db.run("DELETE FROM articles WHERE id = ?", articleId);
      res.json({ message: "Deleted" });
    } catch (err) {
      console.error("Error deleting article:", err);
      res.status(500).json({ error: "Failed to delete article" });
    }
  });

  return router;
}
