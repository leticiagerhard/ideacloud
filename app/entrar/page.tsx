import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Entrar · Ideacloud" };

export default function EntrarPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col items-center justify-center gap-6 px-6 pb-[env(safe-area-inset-bottom)]">
      <div className="text-6xl" aria-hidden>
        ☁️
      </div>
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">Ideacloud</h1>
        <p className="mt-1 text-ink-soft">Seu cantinho de ideias e projetos.</p>
      </div>
      <LoginForm />
    </main>
  );
}
