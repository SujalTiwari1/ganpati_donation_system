import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { clearSession, setStoredToken, UNAUTHORIZED_EVENT } from "@/api/client";
import { authService, type LoginPayload } from "@/api/services/auth.service";
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from "@/constants";
import type { User } from "@/types/api";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isVolunteer: boolean;
  mustChangePassword: boolean;
  isBooting: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isAdmin = user?.role === "ADMIN";
  const isVolunteer = user?.role === "VOLUNTEER";
  const mustChangePassword = Boolean(user?.mustChangePassword);

  const persistUser = useCallback((nextUser: User | null) => {
    setUser(nextUser);
    if (nextUser) {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      window.localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    const storedUser = window.localStorage.getItem(USER_STORAGE_KEY);
    if (storedToken) setToken(storedToken);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser) as User);
      } catch {
        window.localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
    setIsBooting(false);
  }, []);

  useEffect(() => {
    const handler = () => {
      setUser(null);
      setToken(null);
      queryClient.clear();
      navigate({ to: "/login", replace: true });
    };
    window.addEventListener(UNAUTHORIZED_EVENT, handler);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handler);
  }, [navigate, queryClient]);

  const login = useCallback(async (payload: LoginPayload) => {
    const result = await authService.login(payload);
    setStoredToken(result.accessToken);
    persistUser(result.user);
    setToken(result.accessToken);
    return result.user;
  }, [persistUser]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Session teardown proceeds even if the server call fails.
    }
    await queryClient.cancelQueries();
    queryClient.clear();
    clearSession();
    persistUser(null);
    setToken(null);
    toast.success("Signed out");
    navigate({ to: "/login", replace: true });
  }, [navigate, queryClient, persistUser]);

  const refreshProfile = useCallback(async () => {
    const profile = await authService.me();
    persistUser(profile);
  }, [persistUser]);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      const updated = await authService.changePassword({
        currentPassword,
        newPassword,
      });
      persistUser({ ...updated, mustChangePassword: false });
    },
    [persistUser],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isAdmin,
      isVolunteer,
      mustChangePassword,
      isBooting,
      login,
      logout,
      refreshProfile,
      changePassword,
    }),
    [user, token, isAdmin, isVolunteer, mustChangePassword, isBooting, login, logout, refreshProfile, changePassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}