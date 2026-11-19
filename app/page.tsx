export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="text-6xl" aria-hidden>
        ☁️
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight">Ideacloud</h1>
      <p className="text-ink-soft">
        Um cantinho para suas ideias e projetos criativos.
      </p>
      <span className="rounded-full bg-sage-100 px-4 py-2 text-sm font-semibold text-sage-700">
        Etapa 1 pronta · o app está instalável
      </span>
    </main>
  );
}
