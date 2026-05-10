import type { HoleConfig, Round } from './types';

/** Computed shots received purely from stroke-index and handicap. */
export function shotsReceived(strokeIndex: number, handicap: number): number {
  if (handicap <= 0) return 0;
  const base = Math.floor(handicap / 18);
  const extra = strokeIndex <= handicap % 18 ? 1 : 0;
  return base + extra;
}

/** Effective shots received for a hole — uses the per-hole override when set. */
export function effectiveShotsReceived(hole: HoleConfig, handicap: number): number {
  if (hole.shotsReceivedOverride !== undefined) return hole.shotsReceivedOverride;
  return shotsReceived(hole.strokeIndex, handicap);
}

export function stablefordPoints(args: {
  strokes: number;
  par: number;
  strokeIndex: number;
  handicap: number;
  shotsReceivedOverride?: number;
}): number {
  const { strokes, par, strokeIndex, handicap, shotsReceivedOverride } = args;
  if (strokes <= 0) return 0;
  const shots =
    shotsReceivedOverride !== undefined
      ? shotsReceivedOverride
      : shotsReceived(strokeIndex, handicap);
  const net = strokes - shots;
  const diff = net - par;
  if (diff <= -2) return 4;
  if (diff === -1) return 3;
  if (diff === 0) return 2;
  if (diff === 1) return 1;
  return 0;
}

export type RoundTotals = {
  strokes: number;
  putts: number;
  points: number;
  vsPar: number;
  parPlayed: number;
  holesPlayed: number;
};

export function roundTotals(round: Round): RoundTotals {
  let strokes = 0;
  let putts = 0;
  let points = 0;
  let parPlayed = 0;
  let holesPlayed = 0;

  for (const hole of round.holes) {
    const score = round.scores[hole.hole];
    if (!score || score.strokes <= 0) continue;
    strokes += score.strokes;
    putts += score.putts;
    parPlayed += hole.par;
    holesPlayed += 1;
    points += stablefordPoints({
      strokes: score.strokes,
      par: hole.par,
      strokeIndex: hole.strokeIndex,
      handicap: round.handicap,
      shotsReceivedOverride: hole.shotsReceivedOverride,
    });
  }

  return {
    strokes,
    putts,
    points,
    vsPar: strokes - parPlayed,
    parPlayed,
    holesPlayed,
  };
}

export function holeLabel(diff: number): string {
  if (diff <= -3) return 'Albatross';
  if (diff === -2) return 'Eagle';
  if (diff === -1) return 'Birdie';
  if (diff === 0) return 'Par';
  if (diff === 1) return 'Bogey';
  if (diff === 2) return 'Double';
  return `+${diff}`;
}

export function defaultHoles(holeCount: 9 | 18): HoleConfig[] {
  const pars9 = [4, 4, 3, 5, 4, 4, 3, 4, 5];
  const pars18 = [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 5, 3, 4, 4, 5, 3, 4, 4];
  const pars = (holeCount === 9 ? pars9 : pars18).slice(0, holeCount);
  return pars.map((par, i) => ({
    hole: i + 1,
    par,
    strokeIndex: i + 1,
  }));
}
