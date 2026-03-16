import { useState } from "react";
import { AuthContext } from "./useAuth";

function decodeToken(t) {
  try {
    const payload = JSON.parse(atob(t.split(".")[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function init() {
  const t = localStorage.getItem("token");
  if (!t) return { token: null, user: null };
  const decoded = decodeToken(t);
  if (!decoded) {
    localStorage.removeItem("token");
    return { token: null, user: null };
  }
  return { token: t, user: decoded };
}

// Only exports a component — satisfies react-refresh/only-export-components
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => init().token);
  const [user, setUser] = useState(() => init().user);

  function login(newToken) {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(decodeToken(newToken));
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
