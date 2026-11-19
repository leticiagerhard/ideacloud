import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, safeEqual, sessionToken } from "@/lib/session";

// Portão de senha: sem o cookie de sessão válido, tudo vai para /entrar.
export async function proxy(request: NextRequest) {
  const password = process.env.APP_PASSWORD;

  // Se a senha não foi configurada, o app fica FECHADO (nunca aberto por engano).
  if (!password) {
    return new NextResponse(
      "Ideacloud: defina a variável APP_PASSWORD para liberar o app.",
      { status: 503 },
    );
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token && safeEqual(token, await sessionToken(password))) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/entrar", request.url));
}

export const config = {
  // Tudo é protegido, exceto a tela de entrada e os arquivos do PWA.
  matcher: [
    "/((?!entrar|_next/static|_next/image|manifest.webmanifest|sw.js|offline.html|icon.png|icons/).*)",
  ],
};
