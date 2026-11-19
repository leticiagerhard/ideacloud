// Sessão por senha única. Sem dependências do Node: usa só Web Crypto, para
// funcionar tanto no proxy quanto nas Server Actions.
//
// O cookie guarda um HMAC derivado da senha (nunca a senha em si). Trocar a
// APP_PASSWORD invalida automaticamente todos os aparelhos já conectados.

export const SESSION_COOKIE = "ideacloud_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 365; // 1 ano

const encoder = new TextEncoder();

export async function sessionToken(password: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode("ideacloud-session-v1"));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Comparação em tempo constante (evita descobrir a senha pelo tempo de resposta). */
export function safeEqual(a: string, b: string): boolean {
  const ab = encoder.encode(a);
  const bb = encoder.encode(b);
  let diff = ab.length ^ bb.length;
  const len = Math.max(ab.length, bb.length);
  for (let i = 0; i < len; i++) diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
  return diff === 0;
}
