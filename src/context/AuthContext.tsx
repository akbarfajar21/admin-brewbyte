import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdmin = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    return data?.role === "admin";
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          checkAdmin(session.user.id)
            .then((admin) => {
              if (mounted) setIsAdmin(admin);
            })
            .catch(() => {
              if (mounted) setIsAdmin(false);
            })
            .finally(() => {
              if (mounted) setLoading(false);
            });
        } else {
          if (mounted) setLoading(false);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (event === "SIGNED_OUT") {
        setIsAdmin(false);
        setSession(null);
        setUser(null);
      } else if (session?.user) {
        checkAdmin(session.user.id)
          .then((admin) => {
            if (mounted) setIsAdmin(admin);
          })
          .catch(() => {
            if (mounted) setIsAdmin(false);
          });
      } else {
        setIsAdmin(false);
      }
    });

    const timer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 2000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Always clear state manually to be safe
      setUser(null);
      setSession(null);
      setIsAdmin(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, session, isAdmin, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
