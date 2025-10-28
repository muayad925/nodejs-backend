import { Router } from "express";
import { StreamController } from "../controllers/streamController.js";

const router = Router();

router.get("/", StreamController.connect);

export default router;
