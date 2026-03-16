import { createContext, useContext } from "react";

// Context object lives here alongside the hook — both are non-components,
// so this file is the right home for them. AuthContext.jsx imports it back.
export const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}
