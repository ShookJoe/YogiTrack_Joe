// Express entry point: wires up middleware, the API routes for each
// entity, and (in production) serves the built React app as static files
// so the whole project runs as a single Heroku dyno.
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import healthRouter from "./routes/health.js";
import instructorsRouter from "./routes/instructors.js";
import customersRouter from "./routes/customers.js";
import classesRouter from "./routes/classes.js";
import { basicAuth } from "./middleware/basicAuth.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
// Gate everything (API + static UI) behind Basic Auth in production;
// see middleware/basicAuth.js for why this is a no-op locally.
app.use(basicAuth);

app.use("/api/health", healthRouter);
app.use("/api/instructors", instructorsRouter);
app.use("/api/customers", customersRouter);
app.use("/api/classes", classesRouter);

// In production there's no separate Vite dev server, so Express serves
// the client's built files directly and falls back to index.html for
// any non-API route (React Router-style client-side routing).
if (process.env.NODE_ENV === "production") {
  const clientDist = path.join(__dirname, "..", "client", "dist");
  app.use(express.static(clientDist));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

async function start() {
  try {
    await connectDB();
  } catch (err) {
    // Don't crash the server if the DB is unreachable -- the health
    // endpoint will report it, and routes that need the DB will fail
    // individually instead of taking the whole app down.
    console.error("Failed to connect to MongoDB:", err.message);
  }
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start();
