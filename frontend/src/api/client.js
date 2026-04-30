const BASE = import.meta.env.VITE_API_URL || "/api";

export async function request(method, path, body = null) {
  const token = localStorage.getItem("token");

  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // If body is FormData (file upload), do NOT set Content-Type —
  // the browser sets it automatically with the correct multipart boundary.
  // If body is a plain object, serialize to JSON.
  let serializedBody = null;
  if (body instanceof FormData) {
    serializedBody = body;
  } else if (body !== null) {
    headers["Content-Type"] = "application/json";
    serializedBody = JSON.stringify(body);
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: serializedBody,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || `Request failed: ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const get = (path) => request("GET", path);
export const post = (path, body) => request("POST", path, body);
export const put = (path, body) => request("PUT", path, body);
export const del = (path) => request("DELETE", path);
