import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface AdminUser {
  name?: string;
  email?: string;
  [key: string]: unknown;
}

interface AuthContextValue {
  token: string | null;
  admin: AdminUser | null;
  isAuthenticated: boolean;
  login: (token: string, admin: AdminUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const readStoredAdmin = (): AdminUser | null => {
  const raw = localStorage.getItem("admin");

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("adminToken"),
  );
  const [admin, setAdmin] = useState<AdminUser | null>(readStoredAdmin);

  // Keep auth state in sync across tabs (e.g. logout in one tab logs out all tabs).
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "adminToken") setToken(e.newValue);
      if (e.key === "admin") setAdmin(readStoredAdmin());
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = (newToken: string, newAdmin: AdminUser) => {
    localStorage.setItem("adminToken", newToken);
    localStorage.setItem("admin", JSON.stringify(newAdmin));
    setToken(newToken);
    setAdmin(newAdmin);
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    localStorage.removeItem("token");
    setToken(null);
    setAdmin(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      admin,
      isAuthenticated: !!token,
      login,
      logout,
    }),
    [token, admin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return ctx;
}
