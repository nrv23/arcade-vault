"use client";

import { useRouter } from "next/navigation";

export function GameDetailActions({ id }: { id: string }) {
  const router = useRouter();

  return (
    <div className="detail-actions">
      <button
        className="btn xl pulse"
        onClick={() => router.push(`/juegos/${id}/jugar`)}
      >
        ▶ JUGAR AHORA
      </button>
      <button className="btn ghost lg" onClick={() => router.push("/games")}>
        VOLVER AL VAULT
      </button>
    </div>
  );
}
