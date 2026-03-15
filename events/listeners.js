const eventBus = require("./eventBus");
const { BOOKING_CREATED, EVENT_UPDATED } = require("./eventTypes");

eventBus.on(BOOKING_CREATED, (data) => {
  console.log(
    `Booking confirmation email sent to ${data.email} for event ${data.eventTitle}`,
  );
});

eventBus.on(EVENT_UPDATED, (data) => {
  console.log(`Event update notification sent for event ${data.eventTitle}`);
});
