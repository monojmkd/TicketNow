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
    connectTimeout: 60000,
  },
  pool: {
    max: 2,
    min: 0,
    acquire: 60000,
    idle: 10000,
  },
});

module.exports = sequelize;
