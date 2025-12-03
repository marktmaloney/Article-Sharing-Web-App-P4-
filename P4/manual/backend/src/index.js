import express from "express";
import cors from "cors";
import { createDbConnection } from "./db.js";
import { ensureAdminUser } from "./seedAdmin.js";
import { createAuthRouter } from "./routes/authRoutes.js";
import { createArticleRouter } from "./routes/articleRoutes.js";

const PORT = process.env.PORT || 4000;

async function main() {
  const db = await createDbConnection();
  await ensureAdminUser(db);

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", createAuthRouter(db));
  app.use("/api/articles", createArticleRouter(db));

  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Fatal error in server startup:", err);
  process.exit(1);
});
