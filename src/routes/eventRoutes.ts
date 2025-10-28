// src/routes/eventRoutes.ts
import { Router } from "express";
import { StreamController } from "../controllers/streamController.js";

const router = Router();

// POST /api/events -> broadcast to all clients
router.post("/", (req, res) => {
  const { league, type, payload } = req.body;

  // e.g. { league: "42", type: "MATCH_UPDATE", payload: {...} }
  StreamController.broadcast({ league, type, payload, timestamp: Date.now() });
  res.json({ success: true });
});

export default router;
