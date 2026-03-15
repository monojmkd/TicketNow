const { Booking, Event } = require("../models");
const eventBus = require("../events/eventBus");
const { BOOKING_CREATED } = require("../events/eventTypes");

exports.createBooking = async (req, res, next) => {
  try {
    const { eventId, tickets } = req.body;

    if (!eventId || !tickets || tickets <= 0)
      return res.status(400).json({ message: "Invalid booking request" });

    const event = await Event.findByPk(eventId);

    if (!event) return res.status(404).json({ message: "Event not found" });

    if (tickets > event.availableTickets)
      return res.status(400).json({ message: "Tickets unavailable" });

    const booking = await Booking.create({
      userId: req.user.id,
      eventId,
      ticketsBooked: tickets,
    });

    event.availableTickets -= tickets;
    await event.save();

    eventBus.emit(BOOKING_CREATED, {
      email: req.user.email,
      eventTitle: event.title,
    });

    res.json(booking);
  } catch (err) {
    next(err);
  }
};
