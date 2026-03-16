const queue = require("../queues/notification.queue");

/**
 * NotificationWorker
 *
 * Listens for 'process' events from the NotificationQueue and runs the
 * correct handler for each job type.
 *
 * In production each handler would call an email service (SendGrid, SES, etc.)
 * or a push notification API. Here we simulate with console.log + a small
 * artificial delay so the async nature is visible in the logs.
 */

queue.on("process", async (job) => {
  try {
    switch (job.type) {
      case "booking_confirmation":
        await handleBookingConfirmation(job.payload);
        break;
      case "event_update":
        await handleEventUpdate(job.payload);
        break;
      default:
        console.warn(`[Worker] Unknown job type: ${job.type}`);
    }
  } catch (err) {
    // Log and continue — a bad job must never crash the worker
    console.error(
      `[Worker] Failed to process job type=${job.type}: ${err.message}`,
    );
  }
});

// ─── Handlers ─────────────────────────────────────────────────────────────────

async function handleBookingConfirmation(payload) {
  await simulateDelay(100); // simulate async email API call

  console.log("-------------------------------------------");
  console.log("[Worker] BOOKING CONFIRMATION EMAIL");
  console.log(`  To      : ${payload.email}`);
  console.log(`  Name    : ${payload.name}`);
  console.log(`  Event   : ${payload.eventTitle}`);
  console.log(`  Tickets : ${payload.tickets}`);
  console.log("-------------------------------------------");
}

async function handleEventUpdate(payload) {
  if (!payload.customers || payload.customers.length === 0) {
    console.log(
      `[Worker] No customers to notify for event "${payload.eventTitle}"`,
    );
    return;
  }

  await simulateDelay(100);

  console.log("-------------------------------------------");
  console.log("[Worker] EVENT UPDATE NOTIFICATIONS");
  console.log(`  Event : ${payload.eventTitle}`);
  console.log(`  Notifying ${payload.customers.length} customer(s):`);
  payload.customers.forEach((c) => console.log(`    → ${c.name} <${c.email}>`));
  console.log("-------------------------------------------");
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function simulateDelay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
