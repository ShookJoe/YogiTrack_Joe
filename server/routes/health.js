import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

// GET /api/health -- lightweight status check used while developing
// to confirm the API is up and whether it's actually reached the DB.
router.get("/", (req, res) => {
  res.json({
    status: "ok",
    dbConnected: mongoose.connection.readyState === 1,
  });
});

export default router;
