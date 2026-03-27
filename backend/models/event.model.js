const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Event = sequelize.define("Event", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  description: DataTypes.TEXT,

  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },

  location: DataTypes.STRING,
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },

  totalTickets: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  availableTickets: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Event;
