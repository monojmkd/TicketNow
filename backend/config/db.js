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
    prepare: false,
  },
  pool: {
    max: 2,
    min: 0,
    acquire: 60000,
    idle: 10000,
    evict: 10000,
    // Validate the connection is still alive before handing it to a query.
    // Without this, Sequelize reuses a connection that Supabase already
    // dropped (ETIMEDOUT) instead of opening a fresh one.
    validate: (connection) => {
      return connection && !connection._ending && connection._connected;
    },
  },
});

module.exports = sequelize;
