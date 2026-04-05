import { Router } from "express";
import { auth } from "../auth.js";
import { toNodeHandler } from "better-auth/node";

const router = Router();

// Better Auth handles all /api/auth/* routes
router.all("/{*path}", toNodeHandler(auth));

export default router;
