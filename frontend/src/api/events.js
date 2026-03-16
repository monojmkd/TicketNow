import { get, post, put } from "./client";

export const getEvents = (page = 1, limit = 9) =>
  get(`/events?page=${page}&limit=${limit}`);
export const createEvent = (data) => post("/events", data);
export const updateEvent = (id, data) => put(`/events/${id}`, data);
