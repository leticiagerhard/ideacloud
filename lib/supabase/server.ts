import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente do Supabase para uso SOMENTE no servidor.
 * Usa a chave secreta, que ignora a RLS. O "server-only" faz o build falhar se
 * alguém tentar importar este arquivo num componente de navegador.
 */
export function db() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error(
      "Faltam SUPABASE_URL e/ou SUPABASE_SECRET_KEY nas variáveis de ambiente.",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
