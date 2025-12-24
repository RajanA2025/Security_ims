import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // consider presence of auth_token as authenticated
    return Boolean(localStorage.getItem("auth_token"));
  });

  useEffect(() => {
    // keep isAuthenticated in sync if other code mutates localStorage
    const onStorage = () => setIsAuthenticated(Boolean(localStorage.getItem("auth_token")));
    window.addEventListener("storage", onStorage);
    // Listen for global logout events (e.g., API 401)
    const onAuthLogout = () => {
      setIsAuthenticated(false);
      localStorage.removeItem("auth_token");
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("cid");
      localStorage.removeItem("pillars");
      localStorage.removeItem("account_ids");
      localStorage.removeItem("role");
    };
    window.addEventListener("auth:logout", onAuthLogout);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("auth:logout", onAuthLogout);
    };
  }, []);

  const login = (token) => {
    if (token) {
      localStorage.setItem("auth_token", token);
      setIsAuthenticated(true);
    }
  };

  const logout = () => {
    // remove auth and other session data
    localStorage.removeItem("auth_token");
    localStorage.removeItem("cid");
    localStorage.removeItem("pillars");
    localStorage.removeItem("account_ids");
    localStorage.removeItem("timeModal");
        localStorage.removeItem("old_account_ids");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default AuthContext;
