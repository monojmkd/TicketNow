const { Event, Booking, User } = require("../models");
const eventBus = require("../events/eventBus");
const { EVENT_UPDATED } = require("../events/eventTypes");

// Whitelist of fields a client is allowed to set on an event.
// Never spread req.body directly — a caller could inject organizerId or
// availableTickets and silently corrupt the record.
const ALLOWED_CREATE_FIELDS = [
  "title",
  "description",
  "date",
  "location",
  "totalTickets",
  "imageUrl",
];
const ALLOWED_UPDATE_FIELDS = [
  "title",
  "description",
  "date",
  "location",
  "imageUrl",
];

exports.createEvent = async (req, res, next) => {
  try {
    const { title, date, totalTickets } = req.body;

    if (!title || !date || !totalTickets)
      return res
        .status(400)
        .json({
          message: "Missing required fields: title, date, totalTickets",
        });

    // Pick only the fields we explicitly allow — no mass assignment
    const payload = {};
    for (const field of ALLOWED_CREATE_FIELDS) {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    }

    const event = await Event.create({
      ...payload,
      organizerId: req.user.id,
      availableTickets: totalTickets, // always derived from totalTickets on creation
    });

    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
};

exports.getEvents = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    const { count, rows } = await Event.findAndCountAll({
      limit,
      offset,
      order: [["date", "ASC"]],
    });

    res.json({
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
      events: rows,
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

    // Pick only whitelisted fields — prevents callers from overwriting
    // organizerId, availableTickets, totalTickets etc.
    const updates = {};
    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    if (Object.keys(updates).length === 0)
      return res
        .status(400)
        .json({ message: "No valid fields provided for update" });

    await event.update(updates);

    // Fetch every customer who has a confirmed booking for this event so the
    // notification job can address each person by name and email.
    // Without this the listener had no idea who to notify — it just logged the title.
    const bookings = await Booking.findAll({
      where: { eventId: event.id, status: "confirmed" },
      include: [{ model: User, attributes: ["id", "name", "email"] }],
    });

    const customers = bookings.map((b) => ({
      id: b.User.id,
      name: b.User.name,
      email: b.User.email,
    }));

    eventBus.emit(EVENT_UPDATED, {
      eventId: event.id,
      eventTitle: event.title,
      customers, // ← the missing piece
    });

    res.json(event);
  } catch (err) {
    next(err);
  }
};
