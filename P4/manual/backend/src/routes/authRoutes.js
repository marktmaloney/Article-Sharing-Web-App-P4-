// src/routes/authRoutes.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../middleware/authMiddleware.js";

export function createAuthRouter(db) {
  const router = express.Router();

  // POST /api/auth/register
  router.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    try {
      const hash = await bcrypt.hash(password, 10);
      await db.run(
        "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
        username,
        hash,
        "user"
      );
      return res.status(201).json({ message: "User created" });
    } catch (err) {
      if (err.message?.includes("UNIQUE")) {
        return res.status(409).json({ error: "Username already taken" });
      }
      console.error("Error in register:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // POST /api/auth/login
  router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const user = await db.get(
      "SELECT * FROM users WHERE username = ?",
      username
    );

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({ token });
  });

  return router;
}
