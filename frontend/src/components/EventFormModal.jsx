import { useState, useRef } from "react";
import Modal from "./Modal";
import { createEvent, updateEvent } from "../api/events";
import { buildEventFormData } from "../api/upload";

const EMPTY = {
  title: "",
  description: "",
  date: "",
  location: "",
  totalTickets: "",
  price: "",
};

export default function EventFormModal({ event, onClose, onSaved }) {
  const isEdit = Boolean(event);

  const [form, setForm] = useState(
    isEdit
      ? {
          title: event.title || "",
          description: event.description || "",
          date: event.date ? event.date.slice(0, 16) : "",
          location: event.location || "",
          totalTickets: event.totalTickets || "",
          price:
            event.price !== undefined
              ? (event.price / 100).toFixed(2) // cents → dollars for display
              : "",
        }
      : EMPTY,
  );

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(event?.imageUrl || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef();

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Client-side validation before even hitting the server
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setError("Only JPG, PNG, and WebP images are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB");
      return;
    }

    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file)); // local preview before upload
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const fields = {
        title: form.title.trim(),
        description: form.description.trim(),
        date: form.date,
        location: form.location.trim(),
        totalTickets: parseInt(form.totalTickets),
        // Convert dollars back to cents for the backend
        price: Math.round(parseFloat(form.price || 0) * 100),
      };

      // Build multipart/form-data — includes image if one was selected
      const formData = buildEventFormData(fields, imageFile);

      if (isEdit) {
        await updateEvent(event.id, formData);
      } else {
        await createEvent(formData);
      }

      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title={isEdit ? "Edit event" : "New event"} onClose={onClose}>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        {/* Image upload */}
        <div className="form-group">
          <label className="form-label">Event image</label>

          {/* Preview */}
          {imagePreview && (
            <div
              style={{
                marginBottom: 8,
                borderRadius: "var(--radius)",
                overflow: "hidden",
                maxHeight: 160,
              }}
            >
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  width: "100%",
                  height: 160,
                  objectFit: "cover",
                  display: "block",
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => fileInputRef.current.click()}
          >
            {imagePreview ? "Change image" : "Upload image"}
          </button>
          {imageFile && (
            <span className="text-small text-muted" style={{ marginTop: 4 }}>
              {imageFile.name}
            </span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Event title *</label>
          <input
            className="form-input"
            value={form.title}
            onChange={set("title")}
            placeholder="e.g. Node.js Conf 2026"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            value={form.description}
            onChange={set("description")}
            placeholder="What is this event about?"
          />
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <div className="form-group">
            <label className="form-label">Date & time *</label>
            <input
              className="form-input"
              type="datetime-local"
              value={form.date}
              onChange={set("date")}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              className="form-input"
              value={form.location}
              onChange={set("location")}
              placeholder="City or venue"
            />
          </div>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <div className="form-group">
            <label className="form-label">Total tickets *</label>
            <input
              className="form-input"
              type="number"
              min="1"
              value={form.totalTickets}
              onChange={set("totalTickets")}
              placeholder="e.g. 200"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Price (USD)</label>
            <input
              className="form-input"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={set("price")}
              placeholder="0 = Free"
            />
          </div>
        </div>

        {error && <div className="alert alert-error">⚠ {error}</div>}

        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            paddingTop: 4,
          }}
        >
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16 }} />{" "}
                Saving…
              </>
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Create event"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
