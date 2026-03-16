require("dotenv").config();

const app = require("./app");
const sequelize = require("./config/db");

require("./events/listeners");
require("./events/notification_worker");

const PORT = process.env.PORT || 5000;

async function start() {
  // Retry DB connection up to 5 times with 3s between attempts
  let connected = false;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      await sequelize.authenticate();
      console.log(`Database connected (attempt ${attempt})`);
      connected = true;
      break;
    } catch (err) {
      console.warn(`Connection attempt ${attempt} failed: ${err.message}`);
      if (attempt < 5) await new Promise((r) => setTimeout(r, 3000));
    }
  }

  if (!connected) {
    console.error("Could not connect to database after 5 attempts. Exiting.");
    process.exit(1);
  }

  try {
    await sequelize.sync();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start:", err.message);
    process.exit(1);
  }
}

start();
