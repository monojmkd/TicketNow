const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_POOLER_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

module.exports = sequelize;
