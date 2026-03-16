import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { register } from "../api/auth";

export default function RegisterPage() {
  const { login: saveToken } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      // Auto-login after register
      const { login: loginApi } = await import("../api/auth");
      const res = await loginApi({
        email: form.email,
        password: form.password,
      });
      saveToken(res.token);
      navigate("/events");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-glow" />
      <div className="auth-box">
        <div className="auth-logo">TicketNow</div>
        <div className="auth-tagline">Entry Point To Experiences</div>

        <div className="auth-card">
          <h1 className="auth-card-title">Create account</h1>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input
                className="form-input"
                value={form.name}
                onChange={set("name")}
                placeholder="Alice Smith"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                value={form.password}
                onChange={set("password")}
                placeholder="Min. 8 characters"
                required
                minLength={8}
              />
            </div>

            <div className="form-group">
              <label className="form-label">I am a…</label>
              <div className="role-toggle">
                <label
                  className={`role-option ${form.role === "customer" ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="customer"
                    checked={form.role === "customer"}
                    onChange={set("role")}
                  />
                  <span className="role-icon">🎟</span>
                  <span className="role-label">Customer</span>
                </label>
                <label
                  className={`role-option ${form.role === "organizer" ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="organizer"
                    checked={form.role === "organizer"}
                    onChange={set("role")}
                  />
                  <span className="role-icon">🎪</span>
                  <span className="role-label">Organizer</span>
                </label>
              </div>
            </div>

            {error && <div className="alert alert-error">⚠ {error}</div>}

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16 }} />{" "}
                  Creating…
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>
        </div>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
