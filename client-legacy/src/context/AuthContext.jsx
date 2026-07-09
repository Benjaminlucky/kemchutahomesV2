import React from "react";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(true); // Start as true

  const logout = () => {
    const role = user?.role;

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);

    if (role === "admin") {
      window.location.href = "/admin/login";
    } else {
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    // `user` is already hydrated from localStorage in useState's
    // initializer above. There is no unified GET /api/auth/me on the
    // server (each principal — admin/realtor/client — has its own auth
    // routes instead), so a token without a saved user is an
    // inconsistent, unrecoverable state: clear it rather than call an
    // endpoint that doesn't exist.
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && !savedUser) {
      logout();
    }

    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
