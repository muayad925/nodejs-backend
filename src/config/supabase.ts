import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ✅ Service role key is for secure backend usage only.
//    It bypasses Row Level Security (RLS) and can insert/update/delete users.
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
