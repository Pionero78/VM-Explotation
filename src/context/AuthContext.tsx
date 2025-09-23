import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const STORAGE_KEYS = {
  LOCKED: "app_session_locked",
  LOGOUT_NEXT_BOOT: "app_logout_on_next_boot",
  REMEMBERED_EMAIL: "rememberedEmail",
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isSessionLocked: boolean;
  rememberedEmail: string;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  unlockSession: (password: string) => Promise<{ error: AuthError | null }>;
  lockSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_TIMEOUT = 3 * 60 * 60 * 1000;
const WARNING_BEFORE = 5 * 60 * 1000;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSessionLocked, setIsSessionLocked] = useState(false);
  const [rememberedEmail, setRememberedEmail] = useState("");
  const [sessionTimer, setSessionTimer] = useState<NodeJS.Timeout | null>(null);
  const [warningTimer, setWarningTimer] = useState<NodeJS.Timeout | null>(null);
  const [hasShownWarning, setHasShownWarning] = useState(false);

  const lockSession = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.LOCKED, '1');
    setIsSessionLocked(true);
    if (sessionTimer) clearTimeout(sessionTimer);
    if (warningTimer) clearTimeout(warningTimer);
  }, [sessionTimer, warningTimer]);

  const startSessionTimer = useCallback(() => {
    if (sessionTimer) clearTimeout(sessionTimer);
    if (warningTimer) clearTimeout(warningTimer);
    setHasShownWarning(false);

    const wTimer = setTimeout(() => {
      if (!hasShownWarning) {
        setHasShownWarning(true);
        toast.warning("Votre session sera verrouillée dans 5 minutes pour inactivité.");
      }
    }, Math.max(0, SESSION_TIMEOUT - WARNING_BEFORE));
    const sTimer = setTimeout(lockSession, SESSION_TIMEOUT);
    setWarningTimer(wTimer);
    setSessionTimer(sTimer);
  }, [lockSession, sessionTimer, warningTimer, hasShownWarning]);

  const resetSessionTimer = useCallback(() => {
    if (user && !isSessionLocked) {
      startSessionTimer();
    }
  }, [user, isSessionLocked, startSessionTimer]);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEYS.LOCKED) === '1') {
      setIsSessionLocked(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        setRememberedEmail(session.user.email);
        localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, session.user.email);
        if (!isSessionLocked) {
          setIsSessionLocked(false);
          startSessionTimer();
        }
      } else {
        setIsSessionLocked(false);
        if (sessionTimer) clearTimeout(sessionTimer);
        if (warningTimer) clearTimeout(warningTimer);
        setHasShownWarning(false);
        const storedEmail = localStorage.getItem(STORAGE_KEYS.REMEMBERED_EMAIL);
        if (storedEmail) setRememberedEmail(storedEmail);
      }
      setLoading(false);
    });
    return () => {
      subscription.unsubscribe();
      if (sessionTimer) clearTimeout(sessionTimer);
      if (warningTimer) clearTimeout(warningTimer);
    };
  }, [startSessionTimer, isSessionLocked]);

  useEffect(() => {
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"];
    const resetTimer = () => resetSessionTimer();
    events.forEach(event => document.addEventListener(event, resetTimer, true));
    return () => events.forEach(event => document.removeEventListener(event, resetTimer, true));
  }, [resetSessionTimer]);

  useEffect(() => {
    const handleStorageChange = async (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.LOCKED && e.newValue === '1') setIsSessionLocked(true);
      if (e.key === STORAGE_KEYS.LOGOUT_NEXT_BOOT && e.newValue === '1') {
        await supabase.auth.signOut({ scope: 'global' });
        window.location.reload();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      localStorage.removeItem(STORAGE_KEYS.LOCKED);
      localStorage.removeItem(STORAGE_KEYS.LOGOUT_NEXT_BOOT);
      setRememberedEmail(email);
      localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, email);
      setIsSessionLocked(false);
      startSessionTimer();
    }
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    return await supabase.auth.signUp({ email, password });
  };

  const signOut = async () => {
    if (sessionTimer) clearTimeout(sessionTimer);
    if (warningTimer) clearTimeout(warningTimer);
    setHasShownWarning(false);
    setIsSessionLocked(false);

    localStorage.removeItem(STORAGE_KEYS.LOCKED);
    localStorage.removeItem(STORAGE_KEYS.LOGOUT_NEXT_BOOT);
    if(rememberedEmail) localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, rememberedEmail);
    setRememberedEmail("");

    await supabase.auth.signOut({ scope: 'global' });
    window.location.reload();
  };

  const unlockSession = async (password: string) => {
    const emailToUse = rememberedEmail || localStorage.getItem(STORAGE_KEYS.REMEMBERED_EMAIL);
    if (!emailToUse) return { error: new AuthError("Email not found", { status: 400 }) };

    const { error } = await supabase.auth.signInWithPassword({ email: emailToUse, password });
    if (!error) {
      localStorage.removeItem(STORAGE_KEYS.LOCKED);
      localStorage.setItem(STORAGE_KEYS.LOGOUT_NEXT_BOOT, '1');
      setIsSessionLocked(false);
      startSessionTimer();
    }
    return { error };
  };

  const value = { user, session, loading, isSessionLocked, rememberedEmail, signIn, signUp, signOut, unlockSession, lockSession };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
