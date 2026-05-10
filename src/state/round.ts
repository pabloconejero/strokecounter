import type { HoleConfig, HoleCount, PlayMode, Round } from './types';

type CreateRoundInput = {
  holeCount: HoleCount;
  playMode: PlayMode;
  handicap: number;
  holes: HoleConfig[];
};

export function createRound(input: CreateRoundInput): Round {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  const scores: Record<number, { strokes: number; putts: number }> = {};
  for (const h of input.holes) {
    scores[h.hole] = { strokes: 0, putts: 0 };
  }

  return {
    id,
    startedAt: new Date().toISOString(),
    holeCount: input.holeCount,
    playMode: input.playMode,
    handicap: input.handicap,
    holes: input.holes,
    currentHole: 1,
    scores,
  };
}

function bumpHole(
  round: Round,
  field: 'strokes' | 'putts',
  delta: number,
): Round {
  const current = round.scores[round.currentHole] ?? { strokes: 0, putts: 0 };
  const next = Math.max(0, current[field] + delta);
  return {
    ...round,
    scores: {
      ...round.scores,
      [round.currentHole]: { ...current, [field]: next },
    },
  };
}

export function bumpStrokes(round: Round, delta: number): Round {
  return bumpHole(round, 'strokes', delta);
}

export function bumpPutts(round: Round, delta: number): Round {
  return bumpHole(round, 'putts', delta);
}

export function goToHole(round: Round, hole: number): Round {
  const target = Math.min(round.holeCount, Math.max(1, hole));
  return { ...round, currentHole: target };
}

export function isLastHole(round: Round): boolean {
  return round.currentHole >= round.holeCount;
}

export function finishRound(round: Round): Round {
  return { ...round, completedAt: new Date().toISOString() };
}

export function holeAt(round: Round, hole: number): HoleConfig | undefined {
  return round.holes.find((h) => h.hole === hole);
}
