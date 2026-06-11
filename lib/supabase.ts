import { createClient, SupabaseClient } from "@supabase/supabase-js";

const BUCKET = process.env.SUPABASE_BUCKET || "photos";

let admin: SupabaseClient | null = null;

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

/** Faz upload de bytes para o Storage e devolve a URL pública. */
export async function uploadPhoto(
  path: string,
  bytes: Buffer,
  contentType: string
): Promise<string> {
  const sb = supabaseAdmin();
  const { error } = await sb.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType, upsert: true });
  if (error) throw error;
  const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
