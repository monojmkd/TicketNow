const { Sequelize } = require("sequelize");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sequelize = new Sequelize(connectionString, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
    connectTimeout: 30000,
  },
  pool: {
    max: 3,
    min: 0,
    acquire: 60000,  // give bcrypt time to finish before timing out
    idle: 10000,
    evict: 10000,
  },
});

module.exports = sequelize;