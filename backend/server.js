require("dotenv").config();

const app = require("./app");
const sequelize = require("./config/db");

// Boot order matters:
//  1. listeners.js  — registers eventBus → queue bridges
//  2. notification_worker.js — registers the queue 'process' handler
// Both must be required before any HTTP request can arrive.
require("./events/listeners");
require("./workers/notification.worker");

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log("Database connected");

    await sequelize.sync();

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start:", err);
    process.exit(1); // don't silently hang if the DB is unreachable
  }
}

start();
