"use client";

import { useRef } from "react";
import type { MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { formatScore } from "@/app/data";
import type { Game } from "@/app/types";

export function GameCard({ game }: { game: Game }) {
  const router = useRouter();
  const tiltRef = useRef<HTMLDivElement>(null);

  // Tilt 3D imperativo: se muta el transform directamente para no re-renderizar
  // la tarjeta en cada movimiento del ratón.
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = tiltRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `translateY(-6px) rotateX(${-py * 6}deg) rotateY(${px * 8}deg)`;
  };

  const onLeave = () => {
    const el = tiltRef.current;
    if (!el) return;
    el.style.transform = "";
  };

  const btnColor =
    game.color === "magenta" ? "magenta" : game.color === "yellow" ? "yellow" : "";

  return (
    <div
      ref={tiltRef}
      className="card"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={() => router.push(`/juegos/${game.id}`)}
    >
      <div className="cover">
        <div className={"cover-bg " + game.cover} />
        <div className="label">{game.cat}</div>
      </div>
      <div className="meta">
        <div className="title">{game.title}</div>
        <div className="desc">{game.short}</div>
        <div className="row">
          <div className="score-badge">
            <span>MEJOR PUNTUACIÓN</span>
            <b>{formatScore(game.best)}</b>
          </div>
          <button
            className={"btn " + btnColor}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/juegos/${game.id}/jugar`);
            }}
          >
            JUGAR
          </button>
        </div>
      </div>
    </div>
  );
}
