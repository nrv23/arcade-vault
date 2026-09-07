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
