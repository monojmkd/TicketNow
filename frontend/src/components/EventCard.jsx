import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Modal from "./Modal";
import { createBooking } from "../api/bookings";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatPrice(price) {
  const n = parseFloat(price);
  return n === 0 ? "Free" : `₹${n.toFixed(2)}`;
}

export default function EventCard({ event, onEdit, onBooked }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showBook, setShowBook] = useState(false);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isOrganizer = user?.role === "organizer";
  const isOwnEvent = isOrganizer && event.organizerId === user?.id;
  const soldOut = event.availableTickets === 0;

  function handleBookClick() {
    if (!user) return navigate("/login");
    setShowBook(true);
  }

  async function handleBook() {
    setLoading(true);
    setError("");
    try {
      await createBooking(event.id, qty);
      setSuccess(true);
      onBooked?.();
      setTimeout(() => {
        setShowBook(false);
        setSuccess(false);
        setQty(1);
      }, 1400);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function renderAction() {
    if (isOwnEvent)
      return (
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onEdit?.(event)}
        >
          Edit
        </button>
      );
    if (isOrganizer) return null;
    if (soldOut) return null;
    return (
      <button className="btn btn-primary btn-sm" onClick={handleBookClick}>
        Book tickets
      </button>
    );
  }

  return (
    <>
      <div className="card event-card">
        {/* Event image */}
        {event.imageUrl && (
          <div className="event-card-image">
            <img src={event.imageUrl} alt={event.title} />
          </div>
        )}

        <div className="event-card-header">
          <h3 className="event-card-title">{event.title}</h3>
          {isOwnEvent ? (
            <span className="ticket-badge organizer">Yours</span>
          ) : (
            <span
              className={`ticket-badge ${soldOut ? "soldout" : "available"}`}
            >
              {soldOut ? "Sold out" : "Available"}
            </span>
          )}
        </div>

        <div className="event-card-body">
          <div className="event-meta">
            <span className="event-meta-item">
              <span className="event-meta-icon">📅</span>
              {formatDate(event.date)}
            </span>
            {event.location && (
              <span className="event-meta-item">
                <span className="event-meta-icon">📍</span>
                {event.location}
              </span>
            )}
          </div>
          {event.description && (
            <p className="event-desc">{event.description}</p>
          )}
        </div>

        <div className="ticket-divider">
          <div className="ticket-divider-dot" />
          <div className="ticket-divider-dot" style={{ marginLeft: "auto" }} />
        </div>

        <div className="event-card-footer">
          <div>
            <div className="event-price">{formatPrice(event.price || 0)}</div>
            <div className="event-price-label">per ticket</div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 6,
            }}
          >
            <span
              className={`event-tickets-left ${event.availableTickets <= 5 && event.availableTickets > 0 ? "low" : ""}`}
            >
              {event.availableTickets} / {event.totalTickets} left
            </span>
            {renderAction()}
          </div>
        </div>
      </div>

      {showBook && (
        <Modal
          title={event.title}
          onClose={() => {
            setShowBook(false);
            setError("");
            setQty(1);
          }}
        >
          {event.imageUrl && (
            <div className="modal-event-image">
              <img src={event.imageUrl} alt={event.title} />
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span className="event-meta-item">
              <span className="event-meta-icon">📅</span>
              {formatDate(event.date)}
            </span>
            {event.location && (
              <span className="event-meta-item">
                <span className="event-meta-icon">📍</span>
                {event.location}
              </span>
            )}
          </div>

          <div className="ticket-divider">
            <div className="ticket-divider-dot" />
            <div
              className="ticket-divider-dot"
              style={{ marginLeft: "auto" }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="form-label">Number of tickets</div>
              <div className="mt-1 text-small text-muted">
                {event.availableTickets} available
              </div>
            </div>
            <div className="qty-stepper">
              <button
                className="qty-btn"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
              >
                −
              </button>
              <div className="qty-display">{qty}</div>
              <button
                className="qty-btn"
                onClick={() =>
                  setQty((q) => Math.min(event.availableTickets, q + 1))
                }
                disabled={qty >= event.availableTickets}
              >
                +
              </button>
            </div>
          </div>

          <div
            className="flex items-center justify-between"
            style={{ padding: "12px 0", borderTop: "1px solid var(--border)" }}
          >
            <span className="text-muted text-small">Total</span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.6rem",
                color: "var(--gold)",
              }}
            >
              {formatPrice(parseFloat(event.price || 0) * qty)}
            </span>
          </div>

          {error && <div className="alert alert-error">⚠ {error}</div>}
          {success && (
            <div className="alert alert-success">✓ Booking confirmed!</div>
          )}

          <button
            className="btn btn-primary btn-full"
            onClick={handleBook}
            disabled={loading || success}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16 }} />{" "}
                Confirming…
              </>
            ) : (
              `Confirm ${qty} ticket${qty > 1 ? "s" : ""}`
            )}
          </button>
        </Modal>
      )}
    </>
  );
}
