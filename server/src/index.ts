import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { prisma } from "./prisma.js";
import { registerSocketHandlers } from "./socket/index.js";
import authRoutes from "./routes/auth.js";
import postsRoutes from "./routes/posts.js";
import commentsRoutes from "./routes/comments.js";
import eventsRoutes from "./routes/events.js";
import marketplaceRoutes from "./routes/marketplace.js";
import groupsRoutes from "./routes/groups.js";
import usersRoutes from "./routes/users.js";

const app = express();
const httpServer = createServer(app);

const clientUrl = process.env.CLIENT_URL ?? "http://localhost:3000";

const io = new Server(httpServer, {
  cors: {
    origin: clientUrl,
    credentials: true,
  },
});

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

registerSocketHandlers(io);

const port = Number(process.env.PORT ?? 3001);

httpServer.listen(port, async () => {
  await prisma.$connect();
  console.log(`API running on http://localhost:${port}`);
});

// Export io so route handlers can broadcast
export { io };
