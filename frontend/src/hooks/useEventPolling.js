import { useEffect, useRef, useCallback } from "react";
import { getMyBookings } from "../api/bookings";
import { getEvents } from "../api/events";
import { useToast } from "../context/useToast";
import { useAuth } from "../context/useAuth";

const POLL_INTERVAL = 30_000; // 30 seconds

// Fields we care about for change detection
const WATCHED_FIELDS = ["title", "date", "location", "description"];

const FIELD_LABELS = {
  title: "title",
  date: "date",
  location: "location",
  description: "description",
};

export function useEventPolling() {
  const { user } = useAuth();
  const { addToast } = useToast();

  // Snapshot of events from the last poll: { [eventId]: { title, date, location, ... } }
  const snapshotRef = useRef(null);

  const poll = useCallback(async () => {
    // Only poll for logged-in customers
    if (!user || user.role !== "customer") return;

    try {
      // Fetch the customer's booked event IDs so we only notify
      // about events they actually care about
      const bookingsData = await getMyBookings();
      const bookings = Array.isArray(bookingsData)
        ? bookingsData
        : bookingsData.bookings || [];

      const confirmedEventIds = new Set(
        bookings.filter((b) => b.status === "confirmed").map((b) => b.eventId),
      );

      if (confirmedEventIds.size === 0) return;

      // Fetch current event data — get enough pages to cover all booked events
      const res = await getEvents(1, 100);
      const events = res.events || [];

      // Build a fresh snapshot of only the booked events
      const fresh = {};
      for (const event of events) {
        if (confirmedEventIds.has(event.id)) {
          fresh[event.id] = event;
        }
      }

      // On first poll just store the snapshot — nothing to diff against yet
      if (snapshotRef.current === null) {
        snapshotRef.current = fresh;
        return;
      }

      // Diff: compare each watched field against the previous snapshot
      for (const [id, current] of Object.entries(fresh)) {
        const previous = snapshotRef.current[id];
        if (!previous) continue; // newly booked event — no baseline yet

        const changed = WATCHED_FIELDS.filter(
          (f) => String(current[f] ?? "") !== String(previous[f] ?? ""),
        );

        if (changed.length > 0) {
          const fieldList = changed.map((f) => FIELD_LABELS[f]).join(", ");
          addToast(
            `"${current.title}" has been updated — ${fieldList} changed.`,
            "update",
            8000, // stay visible longer for important notifications
          );
        }
      }

      // Update snapshot for next poll
      snapshotRef.current = fresh;
    } catch {
      // Polling failures are silent — don't spam the user with error toasts
    }
  }, [user, addToast]);

  useEffect(() => {
    // Run once immediately so the snapshot is populated right away,
    // then repeat on the interval
    poll();
    const id = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [poll]);
}
