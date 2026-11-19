"use server";

import { redirect } from "next/navigation";
import { endSession, startSession } from "@/lib/auth";
import { safeEqual } from "@/lib/session";

export type EntrarState = { error?: string };

export async function entrar(
  _prev: EntrarState,
  formData: FormData,
): Promise<EntrarState> {
  const expected = process.env.APP_PASSWORD;
  if (!expected) return { error: "O app ainda não tem senha configurada." };

  const given = String(formData.get("senha") ?? "");

  if (!safeEqual(given, expected)) {
    // Pequena pausa para desencorajar tentativas em sequência.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { error: "Senha incorreta. Tente de novo." };
  }

  await startSession();
  redirect("/");
}

export async function sair() {
  await endSession();
  redirect("/entrar");
}
