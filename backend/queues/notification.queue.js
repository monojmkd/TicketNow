const { EventEmitter } = require("events");

/**
 * NotificationQueue
 *
 * A simple in-memory FIFO queue for notification jobs.
 * Jobs are processed one at a time so they never pile up concurrently.
 *
 * Why not use the eventBus directly for processing?
 * EventEmitter handlers run synchronously in the same tick as the emit call,
 * which means a slow handler (e.g. real email API call) would block the HTTP
 * response. Putting work on a queue decouples the HTTP layer from the I/O.
 *
 * Each job is an object: { type: string, payload: any }
 * Supported types: 'booking_confirmation' | 'event_update'
 */
class NotificationQueue extends EventEmitter {
  constructor() {
    super();
    this._jobs = [];
    this._running = false;
    this.on("enqueued", () => this._drain());
  }

  /**
   * Add a job to the back of the queue and return immediately.
   * Processing happens asynchronously via the drain loop.
   */
  enqueue(type, payload) {
    this._jobs.push({ type, payload, enqueuedAt: new Date() });
    this.emit("enqueued");
  }

  /** How many jobs are waiting. Useful for health checks / tests. */
  get size() {
    return this._jobs.length;
  }

  async _drain() {
    if (this._running) return; // only one drain loop at a time
    this._running = true;

    while (this._jobs.length > 0) {
      const job = this._jobs.shift();
      this.emit("process", job);
    }

    this._running = false;
  }
}

module.exports = new NotificationQueue();
