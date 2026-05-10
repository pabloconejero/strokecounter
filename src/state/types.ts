export type PlayMode = 'strokes' | 'stableford';

export type HoleCount = 9 | 18;

export type HoleConfig = {
  hole: number;
  par: number;
  strokeIndex: number;
  /** Override the computed shots-received for this hole (e.g. tournament rule adjustments). */
  shotsReceivedOverride?: number;
};

export type HoleScore = {
  strokes: number;
  putts: number;
};

export type Round = {
  id: string;
  startedAt: string;
  holeCount: HoleCount;
  playMode: PlayMode;
  handicap: number;
  holes: HoleConfig[];
  currentHole: number;
  scores: Record<number, HoleScore>;
  completedAt?: string;
};

export type StorageShape = {
  inProgress: Round | null;
  history: Round[];
};
