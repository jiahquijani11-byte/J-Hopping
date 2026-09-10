import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import { logoutUser } from "./api";

export type AuthUser = {
  id: number;
  authToken: string;
  businessName?: string | null;
  profilePictureCacheUri?: string | null;
  profilePictureUrl?: string | null;
  firstName: string | null;
  middleInitial?: string | null;
  lastName: string | null;
  extensionName?: string | null;
  email: string;
  username: string;
  role: "user" | "admin" | "manager";
};

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  signIn: (user: AuthUser) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<Omit<AuthUser, "id" | "role" | "authToken">>) => Promise<void>;
};

const SESSION_KEY = "jhopping.session";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      try {
        const raw = await AsyncStorage.getItem(SESSION_KEY);

        if (!active) {
          return;
        }

        if (raw) {
          const parsed = JSON.parse(raw) as AuthUser;

          if (parsed && typeof parsed.role === "string" && typeof parsed.authToken === "string") {
            setUser(parsed);
            setStatus("authenticated");
            return;
          }
        }

        setStatus("unauthenticated");
      } catch {
        if (active) {
          setStatus("unauthenticated");
        }
      }
    };

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      signIn: async (nextUser) => {
        setUser(nextUser);
        setStatus("authenticated");
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
      },
      signOut: async () => {
        const authToken = user?.authToken;
        setUser(null);
        setStatus("unauthenticated");
        await AsyncStorage.removeItem(SESSION_KEY);

        if (authToken) {
          try {
            await logoutUser(authToken);
          } catch {
            // Local logout must still complete when the API cannot be reached.
          }
        }
      },
      updateUser: async (updates) => {
        if (!user) return;

        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
      },
    }),
    [user, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
