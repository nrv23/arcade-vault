export type GameCategory = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
export type GameColor = "cyan" | "magenta" | "green" | "yellow";

export interface Game {
  id: string; // slug, también param de ruta
  title: string;
  short: string; // blurb de la tarjeta
  long: string; // párrafo del detalle
  cat: GameCategory;
  cover: string; // clase CSS: cover-bricks, cover-tetro, ...
  color: GameColor;
  best: number;
  plays: string; // preformateado, p. ej. "12.4K"
}

export interface ScoreRow {
  rank: number;
  name: string;
  score: number;
  date: string;
}

export interface SessionUser {
  name: string;
}

export interface SavedScore {
  game: string;
  score: number;
  name: string;
  at: number;
}

/** Fila del ticker de últimas puntuaciones de la portada. */
export interface TickerEntry {
  player: string;
  game: string;
  score: number;
  when: string; // relativo y fijo, p. ej. "hace 2 min"
  color: GameColor;
}

/** Fila del top de jugadores de la portada. */
export interface TopPlayer {
  rank: number;
  player: string;
  score: number;
}

/** Bloque de la franja de estadísticas de la portada. */
export interface HomeStat {
  n: string; // "12+", "MILES", "GLOBAL"
  unit: string;
  sub: string;
}
