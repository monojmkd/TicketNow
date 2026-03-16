import { useState, useEffect } from "react";
import { getMyBookings } from "../api/bookings";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function BookingCard({ booking }) {
  const confirmed = booking.status === "confirmed";
  const eventName = booking.Event?.title || booking["Event.title"] || "Event";
  const eventDate = booking.Event?.date || booking["Event.date"] || null;
  const eventLoc = booking.Event?.location || booking["Event.location"] || null;

  return (
    <div className="card booking-card">
      <div className="booking-card-top">
        <h3 className="booking-event-name">{eventName}</h3>
        <span
          className={`status-pill ${confirmed ? "status-confirmed" : "status-cancelled"}`}
        >
          {booking.status}
        </span>
      </div>

      {/* Dashed ticket divider */}
      <div className="ticket-divider">
        <div className="ticket-divider-dot" />
        <div className="ticket-divider-dot" style={{ marginLeft: "auto" }} />
      </div>

      <div className="booking-meta">
        <div className="booking-meta-item">
          <span className="booking-meta-label">Date</span>
          <span className="booking-meta-value">{formatDate(eventDate)}</span>
        </div>
        {eventLoc && (
          <div className="booking-meta-item">
            <span className="booking-meta-label">Location</span>
            <span className="booking-meta-value">{eventLoc}</span>
          </div>
        )}
        <div className="booking-meta-item">
          <span className="booking-meta-label">Tickets</span>
          <span className="booking-meta-value highlight">
            {booking.ticketsBooked}
          </span>
        </div>
        <div className="booking-meta-item">
          <span className="booking-meta-label">Booked on</span>
          <span className="booking-meta-value">
            {formatDate(booking.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyBookings()
      .then((data) => {
        // API may return array directly or wrapped in { bookings: [] }
        setBookings(Array.isArray(data) ? data : data.bookings || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const cancelled = bookings.filter((b) => b.status === "cancelled");

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">
              My <span>Tickets</span>
            </h1>
            <p className="page-subtitle">
              {bookings.length} booking{bookings.length !== 1 ? "s" : ""} total
            </p>
          </div>
        </div>

        {/* Stats */}
        {bookings.length > 0 && (
          <div className="stat-strip">
            <div className="stat-item">
              <div className="stat-value">{bookings.length}</div>
              <div className="stat-label">Total</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="stat-value">{confirmed.length}</div>
              <div className="stat-label">Confirmed</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="stat-value">
                {confirmed.reduce((s, b) => s + b.ticketsBooked, 0)}
              </div>
              <div className="stat-label">Tickets held</div>
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
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎟</div>
            <div className="empty-title">No tickets yet</div>
            <div className="empty-desc">
              Browse events and book your first experience
            </div>
          </div>
        ) : (
          <>
            {confirmed.length > 0 && (
              <>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.2rem",
                    fontWeight: 400,
                    color: "var(--text-muted)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: 16,
                  }}
                >
                  Confirmed
                </h2>
                <div className="events-grid" style={{ marginBottom: 40 }}>
                  {confirmed.map((b) => (
                    <BookingCard key={b.id} booking={b} />
                  ))}
                </div>
              </>
            )}
            {cancelled.length > 0 && (
              <>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.2rem",
                    fontWeight: 400,
                    color: "var(--text-faint)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: 16,
                  }}
                >
                  Past / Cancelled
                </h2>
                <div className="events-grid">
                  {cancelled.map((b) => (
                    <BookingCard key={b.id} booking={b} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
