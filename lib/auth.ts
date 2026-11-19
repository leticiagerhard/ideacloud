import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_MAX_AGE, safeEqual, sessionToken } from "@/lib/session";

/** Defesa em profundidade: o proxy já barra, mas as ações conferem de novo. */
export async function isAuthenticated(): Promise<boolean> {
  const password = process.env.APP_PASSWORD;
  if (!password) return false;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return !!token && safeEqual(token, await sessionToken(password));
}

export async function requireSession(): Promise<void> {
  if (!(await isAuthenticated())) redirect("/entrar");
}

export async function startSession(): Promise<void> {
  const password = process.env.APP_PASSWORD!;
  (await cookies()).set(SESSION_COOKIE, await sessionToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
