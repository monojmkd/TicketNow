require("dns").setDefaultResultOrder("ipv4first");

const { Sequelize } = require("sequelize");
const pg = require("pg");

// 🔥 FORCE SSL at driver level
pg.defaults.ssl = {
  require: true,
  rejectUnauthorized: false,
};

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

module.exports = sequelize;
