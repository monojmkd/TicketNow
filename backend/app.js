require("dotenv").config();

const express = require("express");

const authRoutes = require("./routes/auth.routes");
const eventRoutes = require("./routes/event.routes");
const bookingRoutes = require("./routes/booking.routes");
const errorHandler = require("./middleware/error.middleware");

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Allow all vercel.app subdomains + localhost for dev
  const isAllowed =
    !origin || // same-origin / server-to-server
    origin.endsWith(".vercel.app") || // any Vercel preview/prod URL
    origin === process.env.FRONTEND_URL || // explicit production URL
    /^http:\/\/localhost:\d+$/.test(origin); // local dev

  if (isAllowed) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

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
