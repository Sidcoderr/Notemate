import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Warning: VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY are not set. Please update your client/.env file."
  );
}

// Fallback to dummy values if not yet configured, to prevent initial load crash
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);

