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
    // Required for pgBouncer (Supabase uses this internally)
    prepare: false,
  },
  // Single connection — avoids pool exhaustion on Supabase free tier.
  // Supabase free tier allows only 15 connections total across all clients.
  // A pool of even 2-3 connections causes timeouts when sync() runs at startup.
  pool: {
    max: 1,
    min: 0,
    acquire: 120000,
    idle: 30000,
    evict: 30000,
  },
});

module.exports = sequelize;
