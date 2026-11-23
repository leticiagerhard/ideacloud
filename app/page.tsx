import { Suspense } from "react";
import { connection } from "next/server";
import { db } from "@/lib/supabase/server";
import { sair } from "./entrar/actions";

// Tela provisória da etapa 2: confirma que a senha e o banco estão funcionando.
async function contarIdeias(): Promise<{ count: number } | { erro: string }> {
  try {
    const { count, error } = await db()
      .from("ideas")
      .select("*", { count: "exact", head: true });
    if (error) return { erro: error.message };
    return { count: count ?? 0 };
  } catch (e) {
    return { erro: e instanceof Error ? e.message : "erro desconhecido" };
  }
}

async function DbStatus() {
  await connection(); // sempre consulta o banco na hora, nunca em cache
  const result = await contarIdeias();
  if ("erro" in result) {
    return (
      <span className="max-w-sm rounded-2xl bg-peach-100 px-4 py-3 text-sm font-semibold text-ink">
        Não consegui falar com o banco: {result.erro}
      </span>
    );
  }
  return (
    <span className="rounded-full bg-sage-100 px-4 py-2 text-sm font-semibold text-sage-700">
      Banco conectado ✓ · {result.count} ideias no baú
    </span>
  );
}

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="text-6xl" aria-hidden>
        ☁️
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight">Ideacloud</h1>
      <p className="text-ink-soft">
        Um cantinho para suas ideias e projetos.
      </p>
      <Suspense
        fallback={
          <span className="rounded-full bg-line px-4 py-2 text-sm text-ink-soft">
            Conferindo o banco…
          </span>
        }
      >
        <DbStatus />
      </Suspense>
      <form action={sair}>
        <button className="min-h-12 rounded-full px-5 text-sm font-semibold text-ink-soft underline">
          Sair
        </button>
      </form>
    </main>
  );
}
