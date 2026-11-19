"use client";

import { useEffect } from "react";

/** Registra o service worker (só em produção, para não atrapalhar o dev). */
export function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* sem service worker o app continua funcionando normalmente */
    });
  }, []);

  return null;
}
