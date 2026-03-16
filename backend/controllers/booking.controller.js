const { Booking, Event } = require("../models");
const sequelize = require("../config/db");
const eventBus = require("../events/eventBus");
const { BOOKING_CREATED } = require("../events/eventTypes");

exports.createBooking = async (req, res, next) => {
  const { eventId, tickets } = req.body;

  if (!eventId || !tickets || tickets <= 0)
    return res.status(400).json({ message: "Invalid booking request" });

  // Wrap the entire read-check-write in a transaction with a pessimistic
  // row lock (LOCK IN SHARE MODE / FOR UPDATE depending on dialect).
  // This means two concurrent requests will queue up at the database level —
  // the second one waits until the first commits, then re-reads the updated
  // availableTickets and correctly returns 400 if seats are gone.
  const t = await sequelize.transaction();

  try {
    // { lock: true } acquires a row-level write lock for the duration of t
    const event = await Event.findByPk(eventId, { transaction: t, lock: true });

    if (!event) {
      await t.rollback();
      return res.status(404).json({ message: "Event not found" });
    }

    if (tickets > event.availableTickets) {
      await t.rollback();
      return res.status(400).json({ message: "Not enough tickets available" });
    }

    const booking = await Booking.create(
      { userId: req.user.id, eventId, ticketsBooked: tickets },
      { transaction: t },
    );

    // Decrement inside the same transaction so the row lock covers this write
    await event.decrement("availableTickets", { by: tickets, transaction: t });

    await t.commit();

    // Emit AFTER the transaction commits — no point notifying if the DB write failed
    eventBus.emit(BOOKING_CREATED, {
      userId: req.user.id,
      email: req.user.email,
      name: req.user.name,
      eventTitle: event.title,
      tickets,
    });

    res.status(201).json(booking);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [{ model: Event, attributes: ["title", "date", "location"] }],
      order: [["createdAt", "DESC"]],
    });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};
