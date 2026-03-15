require("dotenv").config();

const app = require("./app");
const sequelize = require("./config/db");

require("./events/listeners");

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();

    console.log("Supabase database connected");

    await sequelize.sync();

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error(err);
  }
}

start();
