const express = require("express");

const authRoutes = require("./routes/auth.routes");
const eventRoutes = require("./routes/event.routes");
const bookingRoutes = require("./routes/booking.routes");
const errorHandler = require("./middleware/error.middleware");

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────────
// Allow requests from the Vercel frontend and local dev
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "https://ticketnow-eta.vercel.app/",
].filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/bookings", bookingRoutes);

app.get("/health", (_req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() }),
);

// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
