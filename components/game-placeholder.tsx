/**
 * Arena decorativa: arte CSS animado por keyframes, copiado del prototipo.
 * No hay bucle de juego, input ni colisiones. Este es el hueco donde más
 * adelante se montará cada juego real; se sustituye sin tocar el HUD ni el modal.
 */
export function GamePlaceholder() {
  return (
    <div className="game-arena">
      <div className="grid-floor" />
      <div className="enemy e1" />
      <div className="enemy e2" />
      <div className="enemy e3" />
      <div className="player-ship" />
    </div>
  );
}
