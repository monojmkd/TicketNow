const eventBus = require("./eventBus");
const queue = require("../queues/notification.queue");
const { BOOKING_CREATED, EVENT_UPDATED } = require("./eventTypes");

/**
 * These listeners are the bridge between the synchronous eventBus
 * (which fires in the HTTP request/response cycle) and the async
 * notification queue (which runs in the background).
 *
 * The job is done in two steps:
 *   1. Controller emits on eventBus  →  fast, synchronous, non-blocking
 *   2. Listener enqueues on queue    →  worker processes it asynchronously
 *
 * This means the HTTP response is never held up by notification I/O.
 */

eventBus.on(BOOKING_CREATED, (data) => {
  queue.enqueue("booking_confirmation", {
    email: data.email,
    name: data.name,
    eventTitle: data.eventTitle,
    tickets: data.tickets,
  });
});

eventBus.on(EVENT_UPDATED, (data) => {
  // data.customers is the array fetched in event.controller.js before emitting.
  // If there are no confirmed bookings the worker will log a "no customers" message.
  queue.enqueue("event_update", {
    eventId: data.eventId,
    eventTitle: data.eventTitle,
    customers: data.customers,
  });
});
