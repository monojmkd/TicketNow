const { Event, Booking, User } = require("../models");
const { Op } = require("sequelize");
const eventBus = require("../events/eventBus");
const { EVENT_UPDATED } = require("../events/eventTypes");
const { deleteOldImage } = require("../middleware/upload.middleware");

const ALLOWED_CREATE_FIELDS = [
  "title",
  "description",
  "date",
  "location",
  "totalTickets",
  "price",
];
const ALLOWED_UPDATE_FIELDS = [
  "title",
  "description",
  "date",
  "location",
  "price",
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

    const payload = {};
    for (const field of ALLOWED_CREATE_FIELDS) {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    }

    if (req.file?.path) {
      payload.imageUrl = req.file.path;
    }

    const event = await Event.create({
      ...payload,
      organizerId: req.user.id,
      availableTickets: totalTickets,
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
    const search = req.query.search?.trim();
    const location = req.query.location?.trim();

    const where = {};

    if (search) {
      where.title = { [Op.iLike]: `%${search}%` };
    }

    if (location) {
      where.location = { [Op.iLike]: `%${location}%` };
    }

    const { count, rows } = await Event.findAndCountAll({
      where,
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

    const updates = {};
    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    if (req.file?.path) {
      await deleteOldImage(event.imageUrl);
      updates.imageUrl = req.file.path;
    }

    if (Object.keys(updates).length === 0)
      return res
        .status(400)
        .json({ message: "No valid fields provided for update" });

    await event.update(updates);

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
      customers,
    });

    res.json(event);
  } catch (err) {
    next(err);
  }
};
