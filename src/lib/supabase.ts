import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables:", {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey,
  });
  throw new Error(
    "Missing Supabase environment variables. Please check your project settings.",
  );
}

// Enhanced Supabase client configuration for production deployment
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
  global: {
    headers: {
      "X-Client-Info": "tempo-mission-order-generator",
    },
  },
});
