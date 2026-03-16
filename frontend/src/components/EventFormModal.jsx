import { useState, useRef } from "react";
import Modal from "./Modal";
import { createEvent, updateEvent } from "../api/events";
import { uploadImage } from "../lib/supabase";

const EMPTY = {
  title: "",
  description: "",
  date: "",
  location: "",
  totalTickets: "",
  price: "",
};

const ACCEPTED = "image/jpeg,image/png,image/webp,image/gif";
const MAX_MB = 5;

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
          price: event.price !== undefined ? event.price : "",
        }
      : EMPTY,
  );

  // Image state — separate from the text form fields
  const [imageFile, setImageFile] = useState(null); // File object chosen by user
  const [imagePreview, setImagePreview] = useState(event?.imageUrl || null); // data URL or existing URL
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError("");

    // Validate type
    if (!file.type.startsWith("image/")) {
      setImageError("Please select an image file (JPEG, PNG, WebP)");
      return;
    }

    // Validate size
    if (file.size > MAX_MB * 1024 * 1024) {
      setImageError(`Image must be under ${MAX_MB}MB`);
      return;
    }

    setImageFile(file);

    // Show local preview immediately — don't wait for upload
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  function handleRemoveImage() {
    setImageFile(null);
    setImagePreview(null);
    setImageError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let imageUrl = event?.imageUrl || null;

      // If the user picked a new file, upload it to Supabase Storage first
      if (imageFile) {
        setImageUploading(true);
        try {
          imageUrl = await uploadImage(imageFile);
        } finally {
          setImageUploading(false);
        }
      }

      // If the user removed the existing image, clear it
      if (!imagePreview && !imageFile) {
        imageUrl = null;
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        date: form.date,
        location: form.location.trim(),
        totalTickets: parseInt(form.totalTickets),
        price: Math.round(parseFloat(form.price || 0) * 100),
        imageUrl,
      };

      if (isEdit) {
        await updateEvent(event.id, payload);
      } else {
        await createEvent(payload);
      }

      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const isBusy = loading || imageUploading;

  return (
    <Modal title={isEdit ? "Edit event" : "New event"} onClose={onClose}>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
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
            <label className="form-label">Price (INR)</label>
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

        {/* ── Image upload ── */}
        <div className="form-group">
          <label className="form-label">Event image</label>

          {imagePreview ? (
            <div className="image-preview-wrap">
              <img
                src={imagePreview}
                alt="Event preview"
                className="image-preview"
              />
              <button
                type="button"
                className="image-remove-btn"
                onClick={handleRemoveImage}
                title="Remove image"
              >
                ✕
              </button>
            </div>
          ) : (
            <label className="image-dropzone">
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED}
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <span className="image-dropzone-icon">🖼</span>
              <span className="image-dropzone-text">Click to upload</span>
              <span className="image-dropzone-hint">
                JPEG, PNG, WebP · max {MAX_MB}MB
              </span>
            </label>
          )}

          {imageError && (
            <div className="alert alert-error" style={{ marginTop: 8 }}>
              ⚠ {imageError}
            </div>
          )}
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
          <button type="submit" className="btn btn-primary" disabled={isBusy}>
            {imageUploading ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16 }} />{" "}
                Uploading image…
              </>
            ) : loading ? (
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
