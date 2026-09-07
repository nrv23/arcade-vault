"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";
import type { SessionUser } from "@/app/types";

const USER_KEY = "av_user";

interface SessionValue {
  user: SessionUser | null;
  signIn: (user: SessionUser) => void;
  signOut: () => void;
}

// ---- Store externo sobre localStorage --------------------------------------
// `localStorage` es un sistema externo a React, así que se lee con
// useSyncExternalStore en vez de copiarlo a estado dentro de un useEffect.

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Cambios hechos desde otra pestaña.
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

// El snapshot debe ser referencialmente estable mientras el valor bruto no
// cambie: devolver un objeto nuevo en cada lectura provocaría renders en bucle.
let cachedRaw: string | null = null;
let cachedUser: SessionUser | null = null;

function getSnapshot(): SessionUser | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(USER_KEY);
  } catch {}
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedUser = raw ? (JSON.parse(raw) as SessionUser | null) : null;
    } catch {
      cachedUser = null;
    }
  }
  return cachedUser;
}

// En el servidor y en el render de hidratación no hay sesión: nada que dependa
// de `user` se renderiza en servidor, así que no hay desajuste de hidratación.
function getServerSnapshot(): SessionUser | null {
  return null;
}

// ---- Contexto --------------------------------------------------------------

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const user = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const signIn = useCallback((next: SessionUser) => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(next));
    } catch {}
    emit();
  }, []);

  const signOut = useCallback(() => {
    try {
      localStorage.removeItem(USER_KEY);
    } catch {}
    emit();
  }, []);

  return (
    <SessionContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error("useSession debe usarse dentro de <SessionProvider>");
  }
  return value;
}
