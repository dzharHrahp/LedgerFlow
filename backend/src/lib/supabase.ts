import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

console.log("SUPABASE URL:", process.env.SUPABASE_URL);
console.log("SERVICE ROLE EXISTS:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log(
  "KEY PREFIX:",
  process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20),
);

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
