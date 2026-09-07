import Link from "next/link";

export default function NotFound() {
  return (
    <div className="fade-in mx-auto my-8 max-w-[600px] px-6 pb-16">
      {/* El error se ve dentro de la máquina: pantalla sin señal, no un aviso
          suelto sobre la página. Reutiliza el marco CRT del reproductor. */}
      <div className="crt">
        <div className="crt-screen">
          <div className="crt-content">
            <div>
              <div className="pixel flicker text-[clamp(40px,14vw,72px)] text-magenta [text-shadow:0_0_10px_rgba(255,0,110,0.6),0_0_28px_rgba(255,0,110,0.35)]">
                404
              </div>
              <div className="mono mt-4 text-[11px] leading-relaxed tracking-[0.16em] text-ink-dim">
                ESTA RANURA DEL VAULT ESTÁ VACÍA
              </div>
            </div>
          </div>
        </div>
        <div className="crt-bottom">
          <span>SEÑAL PERDIDA</span>
          <span>CRT-83 · 0 HZ</span>
          <span>CARTUCHO · AUSENTE</span>
        </div>
      </div>

      <p className="mt-7 text-center text-ink-dim">
        El juego que buscas no existe o cambió de nombre. Vuelve a la biblioteca
        y elige otro cartucho.
      </p>

      <div className="mt-6 text-center">
        <Link href="/" className="btn lg">
          VOLVER AL VAULT
        </Link>
      </div>
    </div>
  );
}
