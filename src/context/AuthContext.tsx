import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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

// Session timeout: 60 minutes with 5-minute warning
const SESSION_TIMEOUT = 60 * 60 * 1000;
const WARNING_BEFORE = 5 * 60 * 1000;

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
  const [warningTimer, setWarningTimer] = useState<NodeJS.Timeout | null>(null);
  const [hasShownWarning, setHasShownWarning] = useState(false);

  // Function to lock the session
  const lockSession = useCallback(() => {
    setIsSessionLocked(true);
    if (sessionTimer) {
      clearTimeout(sessionTimer);
    }
    if (warningTimer) {
      clearTimeout(warningTimer);
    }
  }, [sessionTimer, warningTimer]);

  // Function to start session timer
  const startSessionTimer = useCallback(() => {
    if (sessionTimer) {
      clearTimeout(sessionTimer);
    }
    if (warningTimer) {
      clearTimeout(warningTimer);
    }

    setHasShownWarning(false);

    const warningDelay = SESSION_TIMEOUT - WARNING_BEFORE;
    const wTimer = setTimeout(
      () => {
        if (!hasShownWarning) {
          setHasShownWarning(true);
          toast.warning(
            "Votre session sera verrouillée dans 5 minutes pour inactivité.",
          );
        }
      },
      Math.max(0, warningDelay),
    );

    const timer = setTimeout(() => {
      lockSession();
    }, SESSION_TIMEOUT);

    setWarningTimer(wTimer);
    setSessionTimer(timer);
  }, [lockSession, sessionTimer, warningTimer, hasShownWarning]);

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
        localStorage.setItem("rememberedEmail", session.user.email);
        startSessionTimer();
      } else {
        // Load remembered email from localStorage if no active session
        const storedEmail = localStorage.getItem("rememberedEmail");
        if (storedEmail) {
          setRememberedEmail(storedEmail);
        }
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
        localStorage.setItem("rememberedEmail", session.user.email);
        setIsSessionLocked(false);
        startSessionTimer();
      } else {
        setIsSessionLocked(false);
        if (sessionTimer) {
          clearTimeout(sessionTimer);
        }
        if (warningTimer) {
          clearTimeout(warningTimer);
        }
        setHasShownWarning(false);
        // Load remembered email from localStorage if no active session
        const storedEmail = localStorage.getItem("rememberedEmail");
        if (storedEmail) {
          setRememberedEmail(storedEmail);
        }
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      if (sessionTimer) {
        clearTimeout(sessionTimer);
      }
      if (warningTimer) {
        clearTimeout(warningTimer);
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
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error) {
        setRememberedEmail(email);
        localStorage.setItem("rememberedEmail", email);
        setIsSessionLocked(false);
        startSessionTimer();
      }

      return { error };
    } catch (error) {
      console.error("Sign in error:", error);
      return { error: { message: "Erreur de connexion. Veuillez réessayer." } };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { error };
    } catch (error) {
      console.error("Sign up error:", error);
      return {
        error: {
          message: "Erreur lors de la création du compte. Veuillez réessayer.",
        },
      };
    }
  };

  const signOut = async () => {
    if (sessionTimer) {
      clearTimeout(sessionTimer);
    }
    if (warningTimer) {
      clearTimeout(warningTimer);
    }
    setHasShownWarning(false);
    setIsSessionLocked(false);

    // Store email in localStorage before clearing it from state
    if (rememberedEmail) {
      localStorage.setItem("rememberedEmail", rememberedEmail);
    }

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

    // Reload the application after sign out
    window.location.reload();
  };

  const unlockSession = async (password: string) => {
    const emailToUse =
      rememberedEmail || localStorage.getItem("rememberedEmail");
    if (!emailToUse) {
      return { error: { message: "Email non trouvé" } };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      });

      if (!error) {
        setIsSessionLocked(false);
        startSessionTimer();
      }

      return { error };
    } catch (error) {
      console.error("Unlock session error:", error);
      return {
        error: {
          message: "Erreur lors du déverrouillage. Veuillez réessayer.",
        },
      };
    }
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
