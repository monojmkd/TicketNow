const User = require("./user.model");
const Event = require("./event.model");
const Booking = require("./booking.model");

User.hasMany(Event, { foreignKey: "organizerId" });
Event.belongsTo(User, { foreignKey: "organizerId" });

User.hasMany(Booking, { foreignKey: "userId" });
Booking.belongsTo(User, { foreignKey: "userId" });

Event.hasMany(Booking, { foreignKey: "eventId" });
Booking.belongsTo(Event, { foreignKey: "eventId" });

module.exports = { User, Event, Booking };
