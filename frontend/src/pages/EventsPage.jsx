import { useState, useEffect, useCallback, useRef } from "react";
import { getEvents } from "../api/events";
import EventCard from "../components/EventCard";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [slowLoad, setSlowLoad] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedLocation, setDebouncedLocation] = useState("");
  const debounceRef = useRef(null);

  function handleSearch(e) {
    const val = e.target.value;
    setSearch(val);
    setPage(1);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(val), 400);
  }

  function handleLocation(e) {
    const val = e.target.value;
    setLocation(val);
    setPage(1);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedLocation(val), 400);
  }

  function clearFilters() {
    setSearch("");
    setLocation("");
    setDebouncedSearch("");
    setDebouncedLocation("");
    setPage(1);
  }

  const hasFilters = search || location;

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setSlowLoad(false);
    setError("");

    // If the first load takes more than 3 seconds, show the Render cold start message
    const slowTimer = setTimeout(() => setSlowLoad(true), 3000);

    try {
      const res = await getEvents(page, 9, debouncedSearch, debouncedLocation);
      setEvents(res.events || res.rows || []);
      setPagination({
        total: res.total,
        page: res.page,
        totalPages: res.totalPages || Math.ceil(res.total / 9),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      clearTimeout(slowTimer);
      setLoading(false);
      setSlowLoad(false);
    }
  }, [page, debouncedSearch, debouncedLocation]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filterSummary = [
    debouncedSearch && `"${debouncedSearch}"`,
    debouncedLocation && `in ${debouncedLocation}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">
              Upcoming <span>Events</span>
            </h1>
            <p className="page-subtitle">
              {pagination.total} event{pagination.total !== 1 ? "s" : ""}
              {filterSummary ? ` matching ${filterSummary}` : " available"}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            marginBottom: 32,
            flexWrap: "wrap",
          }}
        >
          {/* Title search */}
          <div
            style={{ position: "relative", flex: "1 1 220px", maxWidth: 340 }}
          >
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "0.9rem",
                pointerEvents: "none",
                opacity: 0.4,
              }}
            >
              🔍
            </span>
            <input
              className="form-input"
              style={{ paddingLeft: 34 }}
              placeholder="Search events…"
              value={search}
              onChange={handleSearch}
            />
          </div>

          {/* Location filter */}
          <div
            style={{ position: "relative", flex: "1 1 200px", maxWidth: 280 }}
          >
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "0.9rem",
                pointerEvents: "none",
                opacity: 0.4,
              }}
            >
              📍
            </span>
            <input
              className="form-input"
              style={{ paddingLeft: 34 }}
              placeholder="Filter by location…"
              value={location}
              onChange={handleLocation}
            />
          </div>

          {hasFilters && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
              Clear
            </button>
          )}
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 24 }}>
            ⚠ {error}
          </div>
        )}

        {loading ? (
          <div
            className="spinner-center"
            style={{ flexDirection: "column", gap: 16 }}
          >
            <div className="spinner" />
            {slowLoad && (
              <div className="cold-start-notice">
                ☕ The backend is on Render's free tier and is waking up from
                sleep. This only happens on the first load — usually takes 30–60
                seconds.
              </div>
            )}
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{hasFilters ? "🔍" : "🎪"}</div>
            <div className="empty-title">
              {hasFilters ? "No events match your search" : "No events yet"}
            </div>
            <div className="empty-desc">
              {" "}
              {hasFilters
                ? "Try different keywords or clear the filters"
                : "Check back soon for upcoming events"}
            </div>
            {hasFilters && (
              <button
                className="btn btn-ghost btn-sm"
                style={{ marginTop: 12 }}
                onClick={clearFilters}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event) => (
              <EventCard key={event.id} event={event} onBooked={fetchEvents} />
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >
              ← Prev
            </button>
            <span className="pagination-info">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= pagination.totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
