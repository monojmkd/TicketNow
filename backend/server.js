require("dotenv").config();

const app = require("./app");
const sequelize = require("./config/db");

require("./events/listeners");
require("./workers/notification.worker");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectWithRetry();
});

async function connectWithRetry() {
  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      await sequelize.authenticate();
      console.log(`Database connected (attempt ${attempt})`);
      await sequelize.sync();
      console.log("Tables ready");
      return;
    } catch (err) {
      console.warn(`DB connection attempt ${attempt} failed: ${err.message}`);
      if (attempt < 10) await new Promise((r) => setTimeout(r, 3000));
    }
  }
  console.error("Could not connect to database after 10 attempts.");
}
