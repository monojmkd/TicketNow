import { get, post, put } from "./client";

export const getEvents = (page = 1, limit = 9, search = "", location = "") => {
  const params = new URLSearchParams({ page, limit });
  if (search.trim()) params.set("search", search.trim());
  if (location.trim()) params.set("location", location.trim());
  return get(`/events?${params}`);
};
export const createEvent = (data) => post("/events", data);
export const updateEvent = (id, data) => put(`/events/${id}`, data);
