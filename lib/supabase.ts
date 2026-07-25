import { createClient, SupabaseClient } from "@supabase/supabase-js";

let admin: SupabaseClient | null = null;

/** true quando as credenciais do Supabase estão configuradas. */
export function hasSupabase(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Cliente Supabase com a service role key — uso exclusivo no servidor. */
export function supabaseAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY não configuradas");
  }
  if (!admin) admin = createClient(url, key, { auth: { persistSession: false } });
  return admin;
}
