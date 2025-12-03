// src/seedAdmin.js
import bcrypt from "bcrypt";

export async function ensureAdminUser(db) {
  const existing = await db.get(
    "SELECT * FROM users WHERE username = ?",
    "admin"
  );
  if (existing) {
    return;
  }

  const hash = await bcrypt.hash("admin", 10);
  await db.run(
    "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
    "admin",
    hash,
    "admin"
  );

  console.log("Seeded admin user (username: admin, password: admin)");
}
