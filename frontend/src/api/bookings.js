import { get, post } from "./client";

export const getMyBookings = () => get("/bookings");
export const createBooking = (eventId, tickets) =>
  post("/bookings", { eventId, tickets });
