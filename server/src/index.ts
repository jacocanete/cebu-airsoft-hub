import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../../.env") });

import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma.js";
import { registerSocketHandlers } from "./socket/index.js";
import authRoutes from "./routes/auth.js";
import postsRoutes from "./routes/posts.js";
import commentsRoutes from "./routes/comments.js";
import eventsRoutes from "./routes/events.js";
import marketplaceRoutes from "./routes/marketplace.js";
import groupsRoutes from "./routes/groups.js";
import usersRoutes from "./routes/users.js";
import pollsRoutes from "./routes/polls.js";
import reportsRoutes from "./routes/reports.js";
import auditRoutes from "./routes/audit.js";
import notificationsRoutes from "./routes/notifications.js";

const app = express();
const httpServer = createServer(app);

const clientUrl = process.env.CLIENT_URL ?? "http://localhost:3000";

const io = new Server(httpServer, {
  cors: {
    origin: clientUrl,
    credentials: true,
  },
});

app.set("io", io);

app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/posts/:postId/comments", commentsRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/listings", marketplaceRoutes);
app.use("/api/groups", groupsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/posts", pollsRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/notifications", notificationsRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    res.status(409).json({ error: "Already exists" });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

registerSocketHandlers(io);

const port = Number(process.env.PORT ?? 3001);

async function start() {
  await prisma.$connect();
  httpServer.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
  });
}

start().catch(console.error);
