import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <NavLink to="/" className="navbar-logo">
          TicketNow<span>.</span>
        </NavLink>

        <div className="navbar-links">
          {user ? (
            <>
              <NavLink
                to="/events"
                className={({ isActive }) =>
                  "nav-link" + (isActive ? " active" : "")
                }
              >
                Events
              </NavLink>

              {user.role === "organizer" && (
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    "nav-link" + (isActive ? " active" : "")
                  }
                >
                  Dashboard
                </NavLink>
              )}

              {user.role === "customer" && (
                <NavLink
                  to="/bookings"
                  className={({ isActive }) =>
                    "nav-link" + (isActive ? " active" : "")
                  }
                >
                  My Tickets
                </NavLink>
              )}

              <span className="nav-badge">{user.role}</span>
              <button className="btn-logout" onClick={handleLogout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-link">
                Sign in
              </NavLink>
              <NavLink to="/register" className="btn btn-primary btn-sm">
                Join
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
