import { useState, useEffect, useCallback } from "react";
import { getEvents } from "../api/events";
import { useAuth } from "../context/useAuth";
import EventCard from "../components/EventCard";
import EventFormModal from "../components/EventFormModal";

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getEvents(page, 9);
      // Filter client-side to only show this organizer's events
      const mine = (res.events || []).filter((e) => e.organizerId === user.id);
      setEvents(mine);
      setPagination({
        total: res.total,
        totalPages: res.totalPages || Math.ceil(res.total / 9),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, user.id]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Derived stats from loaded events
  const totalTickets = events.reduce((s, e) => s + (e.totalTickets || 0), 0);
  const ticketsSold = events.reduce(
    (s, e) => s + ((e.totalTickets || 0) - (e.availableTickets || 0)),
    0,
  );
  const totalRevenue = events.reduce((s, e) => {
    const sold = (e.totalTickets || 0) - (e.availableTickets || 0);
    return s + sold * parseFloat(e.price || 0);
  }, 0);

  function handleSaved() {
    setShowCreate(false);
    setEditingEvent(null);
    fetchEvents();
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">
              Your <span>Events</span>
            </h1>
            <p className="page-subtitle">
              Manage your events and track bookings
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreate(true)}
          >
            + New event
          </button>
        </div>

        {/* Stats strip */}
        {events.length > 0 && (
          <div className="stat-strip">
            <div className="stat-item">
              <div className="stat-value">{events.length}</div>
              <div className="stat-label">Events</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="stat-value">{ticketsSold}</div>
              <div className="stat-label">Tickets sold</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="stat-value">{totalTickets}</div>
              <div className="stat-label">Total capacity</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="stat-value">₹{totalRevenue.toFixed(0)}</div>
              <div className="stat-label">Est. revenue</div>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 24 }}>
            ⚠ {error}
          </div>
        )}

        {loading ? (
          <div className="spinner-center">
            <div className="spinner" />
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎪</div>
            <div className="empty-title">No events yet</div>
            <div className="empty-desc">
              Create your first event to get started
            </div>
            <button
              className="btn btn-primary"
              style={{ marginTop: 16 }}
              onClick={() => setShowCreate(true)}
            >
              + Create event
            </button>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={setEditingEvent}
              />
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
              Page {page} of {pagination.totalPages}
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

      {showCreate && (
        <EventFormModal
          onClose={() => setShowCreate(false)}
          onSaved={handleSaved}
        />
      )}
      {editingEvent && (
        <EventFormModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
