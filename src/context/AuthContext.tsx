import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isSessionLocked: boolean;
  rememberedEmail: string;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  unlockSession: (password: string) => Promise<{ error: any }>;
  lockSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session timeout: 3 hours in milliseconds
const SESSION_TIMEOUT = 3 * 60 * 60 * 1000;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSessionLocked, setIsSessionLocked] = useState(false);
  const [rememberedEmail, setRememberedEmail] = useState("");
  const [sessionTimer, setSessionTimer] = useState<NodeJS.Timeout | null>(null);

  // Function to lock the session
  const lockSession = useCallback(() => {
    setIsSessionLocked(true);
    if (sessionTimer) {
      clearTimeout(sessionTimer);
    }
  }, [sessionTimer]);

  // Function to start session timer
  const startSessionTimer = useCallback(() => {
    if (sessionTimer) {
      clearTimeout(sessionTimer);
    }

    const timer = setTimeout(() => {
      lockSession();
    }, SESSION_TIMEOUT);

    setSessionTimer(timer);
  }, [lockSession, sessionTimer]);

  // Function to reset session timer (on user activity)
  const resetSessionTimer = useCallback(() => {
    if (user && !isSessionLocked) {
      startSessionTimer();
    }
  }, [user, isSessionLocked, startSessionTimer]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        setRememberedEmail(session.user.email);
        startSessionTimer();
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        setRememberedEmail(session.user.email);
        setIsSessionLocked(false);
        startSessionTimer();
      } else {
        setIsSessionLocked(false);
        if (sessionTimer) {
          clearTimeout(sessionTimer);
        }
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      if (sessionTimer) {
        clearTimeout(sessionTimer);
      }
    };
  }, [startSessionTimer, sessionTimer]);

  // Add event listeners for user activity to reset timer
  useEffect(() => {
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    const resetTimer = () => {
      resetSessionTimer();
    };

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, resetTimer, true);
    });

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [resetSessionTimer]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      setRememberedEmail(email);
      setIsSessionLocked(false);
      startSessionTimer();
    }

    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    if (sessionTimer) {
      clearTimeout(sessionTimer);
    }
    setIsSessionLocked(false);
    setRememberedEmail("");

    // Clear any cached form data
    const forms = document.querySelectorAll("form");
    forms.forEach((form) => {
      const passwordInputs = form.querySelectorAll('input[type="password"]');
      passwordInputs.forEach((input) => {
        (input as HTMLInputElement).value = "";
      });
      form.reset();
    });

    // Clear browser autocomplete cache for passwords
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          if (registration.active) {
            registration.active.postMessage({ type: "CLEAR_PASSWORD_CACHE" });
          }
        });
      });
    }

    await supabase.auth.signOut();
  };

  const unlockSession = async (password: string) => {
    if (!rememberedEmail) {
      return { error: { message: "Email non trouvé" } };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: rememberedEmail,
      password,
    });

    if (!error) {
      setIsSessionLocked(false);
      startSessionTimer();
    }

    return { error };
  };

  const value = {
    user,
    session,
    loading,
    isSessionLocked,
    rememberedEmail,
    signIn,
    signUp,
    signOut,
    unlockSession,
    lockSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
