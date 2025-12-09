import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { loginSchema, articleFormSchema } from "@shared/schema";
import { z } from "zod";
import { pool } from "./db";
import connectPgSimple from "connect-pg-simple";

const SALT_ROUNDS = 12;

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

async function ensureAdminExists() {
  const existingAdmin = await storage.getUserByUsername("admin");
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin", SALT_ROUNDS);
    await storage.createUser({
      username: "admin",
      password: hashedPassword,
      isAdmin: true,
    });
    console.log("Admin account created with username: admin, password: admin");
  }
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const PgSession = connectPgSimple(session);
  
  app.use(
    session({
      store: new PgSession({
        pool: pool,
        tableName: "session",
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "fallback-secret-for-dev",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: "lax",
      },
    })
  );

  await ensureAdminExists();

  app.post("/api/auth/register", async (req, res) => {
    try {
      const parseResult = loginSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: parseResult.error.errors[0]?.message || "Invalid input" 
        });
      }

      const { username, password } = parseResult.data;

      if (username.toLowerCase() === "admin") {
        return res.status(400).json({ message: "This username is reserved" });
      }

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
      });

      req.session.userId = user.id;

      const { password: _, ...safeUser } = user;
      res.status(201).json({ user: safeUser });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const parseResult = loginSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: parseResult.error.errors[0]?.message || "Invalid input" 
        });
      }

      const { username, password } = parseResult.data;

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      req.session.userId = user.id;

      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "User not found" });
      }

      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/articles", async (req, res) => {
    try {
      const articles = await storage.getArticles();
      res.json(articles);
    } catch (error) {
      console.error("Get articles error:", error);
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  app.post("/api/articles", requireAuth, async (req, res) => {
    try {
      const parseResult = articleFormSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: parseResult.error.errors[0]?.message || "Invalid input" 
        });
      }

      const { url, title } = parseResult.data;

      const article = await storage.createArticle({
        url,
        title,
        authorId: req.session.userId!,
      });

      res.status(201).json(article);
    } catch (error) {
      console.error("Create article error:", error);
      res.status(500).json({ message: "Failed to create article" });
    }
  });

  app.delete("/api/articles/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;

      const article = await storage.getArticle(id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const canDelete = article.authorId === req.session.userId || user.isAdmin;
      if (!canDelete) {
        return res.status(403).json({ message: "You cannot delete this article" });
      }

      await storage.deleteArticle(id);
      res.json({ message: "Article deleted successfully" });
    } catch (error) {
      console.error("Delete article error:", error);
      res.status(500).json({ message: "Failed to delete article" });
    }
  });

  return httpServer;
}
