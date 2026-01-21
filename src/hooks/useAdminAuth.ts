import { useState, useEffect } from "react";

const ADMIN_AUTH_KEY = "admin_authenticated";

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Check sessionStorage on initial load
    return sessionStorage.getItem(ADMIN_AUTH_KEY) === "true";
  });

  const login = () => {
    sessionStorage.setItem(ADMIN_AUTH_KEY, "true");
    setIsAuthenticated(true);
  };

  const logout = () => {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    setIsAuthenticated(false);
  };

  return { isAuthenticated, login, logout };
}
