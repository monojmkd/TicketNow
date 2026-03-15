const { Event } = require("../models");
const eventBus = require("../events/eventBus");
const { EVENT_UPDATED } = require("../events/eventTypes");

exports.createEvent = async (req, res, next) => {
  try {
    const { title, date, totalTickets } = req.body;

    if (!title || !date || !totalTickets)
      return res.status(400).json({ message: "Missing fields" });

    const event = await Event.create({
      ...req.body,
      organizerId: req.user.id,
      availableTickets: totalTickets,
    });

    res.json(event);
  } catch (err) {
    next(err);
  }
};

exports.getEvents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const offset = (page - 1) * limit;

    const events = await Event.findAndCountAll({
      limit,
      offset,
    });

    res.json({
      total: events.count,
      page,
      events: events.rows,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.organizerId !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    await event.update(req.body);

    eventBus.emit(EVENT_UPDATED, {
      eventTitle: event.title,
    });

    res.json(event);
  } catch (err) {
    next(err);
  }
};
