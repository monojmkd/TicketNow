const { Sequelize } = require("sequelize");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Log the host being used (hide password) so we can verify the URL format
try {
  const url = new URL(connectionString);
  console.log(`DB host: ${url.hostname}:${url.port}`);
  console.log(`DB user: ${url.username}`);
} catch {
  console.log("Could not parse DATABASE_URL");
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
  },
});

module.exports = sequelize;