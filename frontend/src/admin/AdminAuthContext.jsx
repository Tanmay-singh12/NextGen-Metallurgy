
import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import api from "./api";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(
    () => sessionStorage.getItem("adminToken")
  );

  const [admin, setAdmin] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("adminUser") || "null");
    } catch {
      return null;
    }
  });

  const login = useCallback(async (email, password) => {
    const response = await api.post("/admin/auth/login", {
      email,
      password,
    });

    const { token: newToken, admin: adminUser } = response.data;

    if (!newToken || !adminUser) {
      throw new Error("The server returned an invalid login response.");
    }

    sessionStorage.setItem("adminToken", newToken);
    sessionStorage.setItem("adminUser", JSON.stringify(adminUser));

    setToken(newToken);
    setAdmin(adminUser);

    return adminUser;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminUser");
    setToken(null);
    setAdmin(null);
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{ token, admin, isAuthenticated: Boolean(token), login, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error(
      "useAdminAuth must be used inside AdminAuthProvider."
    );
  }

  return context;
}
