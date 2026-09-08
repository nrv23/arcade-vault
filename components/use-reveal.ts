"use client";

import { useEffect } from "react";

/**
 * Revela las secciones marcadas con `.reveal` al entrar en el viewport,
 * añadiéndoles la clase `.in`. Port de `useReveal` de
 * `references/templates/home-about/home.jsx`.
 *
 * Cada elemento se deja de observar en cuanto aparece: la animación es de una
 * sola vez, no se vuelve a ocultar al salir de pantalla.
 */
export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
