require("dotenv").config();

const app = require("./app");
const sequelize = require("./config/db");

require("./events/listeners");
require("./events/notification_worker");

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    // Retry connection up to 5 times with 3s delay between attempts
    // Render and Supabase both need a moment to be ready on cold start
    let lastErr;
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        await sequelize.authenticate();
        console.log(`Database connected (attempt ${attempt})`);
        break;
      } catch (err) {
        lastErr = err;
        console.warn(`Connection attempt ${attempt} failed: ${err.message}`);
        if (attempt < 5) await new Promise((r) => setTimeout(r, 3000));
      }
    }

    if (lastErr && !(await sequelize.authenticate().catch(() => false))) {
      throw lastErr;
    }

    await sequelize.sync();

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start:", err.message);
    process.exit(1);
  }
}

start();
