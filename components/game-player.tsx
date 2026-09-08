"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatScore } from "@/app/data";
import type { Game, SavedScore } from "@/app/types";
import { GamePlaceholder } from "@/components/game-placeholder";
import { useSession } from "@/components/session-provider";

// Solo se escribe: nadie la lee. Se mantiene por fidelidad con el prototipo.
const SCORES_KEY = "av_scores";

export function GamePlayer({ game }: { game: Game }) {
  const router = useRouter();
  const { user } = useSession();

  const [score, setScore] = useState(0);
  // Las vidas nunca bajan: en el prototipo solo se reponen al reiniciar.
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [paused, setPaused] = useState(false);
  const [over, setOver] = useState(false);
  const [saved, setSaved] = useState(false);

  // El nombre editable arranca sin valor: el del usuario solo se conoce en
  // cliente, así que se resuelve al pintar y no se congela en el estado.
  const [name, setName] = useState<string | null>(null);
  const displayName = name ?? user?.name ?? "INVITADO";

  const scoreRef = useRef(0);

  useEffect(() => {
    if (over || paused) return;
    const t = setInterval(() => {
      const next = scoreRef.current + Math.floor(10 + Math.random() * 90);
      scoreRef.current = next;
      setScore(next);
      // Heurística de subida de nivel del prototipo (reproductor.jsx:21).
      if (next > 0 && next % 2500 < 100) setLevel((l) => l + 1);
    }, 220);
    return () => clearInterval(t);
  }, [over, paused]);

  const restart = () => {
    scoreRef.current = 0;
    setScore(0);
    setLives(3);
    setLevel(1);
    setPaused(false);
    setOver(false);
    setSaved(false);
  };

  const saveScore = () => {
    try {
      const all: SavedScore[] = JSON.parse(
        localStorage.getItem(SCORES_KEY) || "[]",
      );
      all.push({ game: game.id, score, name: displayName, at: Date.now() });
      localStorage.setItem(SCORES_KEY, JSON.stringify(all));
    } catch {}
    setSaved(true);
  };

  return (
    <div className="av-player fade-in">
      <div className="player-hud">
        <div className="flex flex-wrap gap-6">
          <div className="hud-stat">
            <div className="l">Jugador</div>
            <div className="v ink">{displayName}</div>
          </div>
          <div className="hud-stat">
            <div className="l">Puntuación</div>
            <div className="v">{formatScore(score)}</div>
          </div>
          <div className="hud-stat lives">
            <div className="l">Vidas</div>
            <div className="v">{"♥ ".repeat(lives).trim() || "—"}</div>
          </div>
          <div className="hud-stat level">
            <div className="l">Nivel</div>
            <div className="v">{String(level).padStart(2, "0")}</div>
          </div>
        </div>
        <div className="hud-actions">
          <button className="btn yellow" onClick={() => setPaused((p) => !p)}>
            {paused ? "REANUDAR" : "PAUSA"}
          </button>
          <button className="btn magenta" onClick={() => setOver(true)}>
            FIN
          </button>
          <button
            className="btn ghost"
            onClick={() => router.push(`/juegos/${game.id}`)}
          >
            SALIR
          </button>
        </div>
      </div>

      <div className="crt">
        <div className="crt-screen">
          <GamePlaceholder />
          {paused && (
            <div className="crt-content z-[5] bg-black/60">
              <div>
                <div className="pixel neon-yellow text-[22px]">EN PAUSA</div>
                <div className="mono mt-2.5 text-[11px] tracking-[0.16em] text-ink-dim">
                  PULSA REANUDAR PARA CONTINUAR
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="crt-bottom">
          <span className="led">SEÑAL OK</span>
          <span>{game.title} · CRT-83 · 60 HZ</span>
          <span>CARGA · 1MB</span>
        </div>
      </div>

      {over && (
        /* Sin cierre al hacer clic fuera: el modal solo se sale por sus botones. */
        <div className="modal-bd">
          <div className="modal">
            <h2>FIN DEL JUEGO</h2>
            <div className="final-label">PUNTUACIÓN FINAL</div>
            <div className="final">{formatScore(score)}</div>
            {!saved ? (
              <div className="input-row">
                <input
                  value={displayName}
                  onChange={(e) =>
                    setName(e.target.value.toUpperCase().slice(0, 10))
                  }
                  placeholder="TUS INICIALES"
                />
                <button className="btn yellow" onClick={saveScore}>
                  GUARDAR PUNTUACIÓN
                </button>
              </div>
            ) : (
              <div className="toast-saved">▸ PUNTUACIÓN GUARDADA_</div>
            )}
            <div className="actions">
              <button className="btn" onClick={restart}>
                JUGAR DE NUEVO
              </button>
              <button
                className="btn magenta"
                onClick={() => router.push("/games")}
              >
                VOLVER AL VAULT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
