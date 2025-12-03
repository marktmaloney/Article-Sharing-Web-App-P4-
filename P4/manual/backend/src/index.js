import express from "express";
import cors from "cors";
import { createDbConnection } from "./db.js";
import { ensureAdminUser } from "./seedAdmin.js";

const PORT = process.env.PORT || 4000;

async function main() {
  const db = await createDbConnection();
  await ensureAdminUser(db);

  const app = express();
  app.use(cors());
  app.use(express.json());

  // simple health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // TODO: add auth and article routes here later, using `db`

  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Fatal error in server startup:", err);
  process.exit(1);
});
