import { createClient } from "@supabase/supabase-js";

// Client Supabase untuk frontend, biasanya dipakai untuk auth/OAuth atau akses Supabase langsung
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
