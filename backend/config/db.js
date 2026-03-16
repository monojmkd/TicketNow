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
    // Required for Supabase transaction pooler (port 6543)
    // Prepared statements don't work with pgBouncer in transaction mode
    prepare: false,
  },
  pool: {
    max: 2, // keep low — Supabase free tier has limited connections
    min: 0,
    acquire: 60000,
    idle: 10000,
    evict: 10000,
  },
});

module.exports = sequelize;
