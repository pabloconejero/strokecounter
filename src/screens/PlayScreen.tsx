import { useState } from 'react';
import type { Round } from '../state/types';
import { Counter } from '../components/Counter';
import { ScorecardOverlay } from '../components/ScorecardOverlay';
import { bumpPutts, bumpStrokes, finishRound, goToHole, holeAt, isLastHole } from '../state/round';
import { effectiveShotsReceived, holeLabel, roundTotals, stablefordPoints } from '../state/scoring';

type Props = {
  round: Round;
  onChange: (next: Round) => void;
  onFinish: (finished: Round) => void;
};

export function PlayScreen({ round, onChange, onFinish }: Props) {
  const [scorecardOpen, setScorecardOpen] = useState(false);

  const hole = holeAt(round, round.currentHole);
  if (!hole) return null;
  const score = round.scores[round.currentHole] ?? { strokes: 0, putts: 0 };
  const totals = roundTotals(round);
  const hcpShots = effectiveShotsReceived(hole, round.handicap);

  const points = stablefordPoints({
    strokes: score.strokes,
    par: hole.par,
    strokeIndex: hole.strokeIndex,
    handicap: round.handicap,
    shotsReceivedOverride: hole.shotsReceivedOverride,
  });
  const diff = score.strokes > 0 ? score.strokes - hole.par : 0;

  const next = () => {
    if (isLastHole(round)) {
      onFinish(finishRound(round));
    } else {
      onChange(goToHole(round, round.currentHole + 1));
    }
  };

  const prev = () => {
    if (round.currentHole > 1) onChange(goToHole(round, round.currentHole - 1));
  };

  const liveLabel = round.playMode === 'stableford' ? 'Points' : 'vs par';
  const liveValue =
    round.playMode === 'stableford'
      ? totals.points
      : totals.holesPlayed === 0
        ? 'E'
        : totals.vsPar > 0
          ? `+${totals.vsPar}`
          : totals.vsPar < 0
            ? totals.vsPar
            : 'E';

  return (
    <main className="screen screen--play">
      <header className="play__header">
        <div className="play__holeMeta">
          <div className="eyebrow eyebrow--cream">Hole</div>
          <div className="play__holeNumber numeric">
            {String(round.currentHole).padStart(2, '0')}
            <span className="play__holeOf">/ {String(round.holeCount).padStart(2, '0')}</span>
          </div>
        </div>
        <div className="play__live">
          <div className="eyebrow eyebrow--cream">{liveLabel}</div>
          <div className="play__liveValue numeric">{liveValue}</div>
          <div className="play__liveSub numeric">
            {totals.strokes} strokes · {totals.putts} putts
          </div>
        </div>
      </header>

      <section className="play__hero">
        <div className="play__holeChips">
          <span className="chip">Par <strong className="numeric">{hole.par}</strong></span>
          <span className="chip">SI <strong className="numeric">{hole.strokeIndex}</strong></span>
          <span className={`chip chip--hcp ${hcpShots > 0 ? 'chip--hcp-on' : ''}`}>
            HCP <strong className="numeric">{hcpShots}</strong>
          </span>
          {score.strokes > 0 && (
            <span
              className={`chip chip--badge ${
                diff < 0 ? 'chip--under' : diff > 0 ? 'chip--over' : 'chip--par'
              }`}
            >
              {holeLabel(diff)}
              {round.playMode === 'stableford' && (
                <span className="chip__pts numeric"> · {points} pts</span>
              )}
            </span>
          )}
        </div>

        <Counter
          label="Strokes"
          value={score.strokes}
          size="hero"
          accent="cream"
          onChange={(d) => onChange(bumpStrokes(round, d))}
        />

        <Counter
          label="Putts"
          value={score.putts}
          size="compact"
          accent="gold"
          onChange={(d) => onChange(bumpPutts(round, d))}
        />
      </section>

      <footer className="play__footer">
        <button
          type="button"
          className="play__nav"
          onClick={prev}
          disabled={round.currentHole <= 1}
          aria-label="Previous hole"
        >
          ←
        </button>
        <button
          type="button"
          className="btn btn--primary play__next"
          onClick={next}
          disabled={score.strokes <= 0}
        >
          <span className="btn__title">
            {isLastHole(round) ? 'Finish round' : 'Next hole'}
          </span>
          {!isLastHole(round) && (
            <span className="btn__detail numeric">→ Hole {round.currentHole + 1}</span>
          )}
        </button>
        <button
          type="button"
          className="play__nav"
          onClick={() => setScorecardOpen(true)}
          aria-label="Overall score"
        >
          ☷
        </button>
      </footer>

      {scorecardOpen && (
        <ScorecardOverlay round={round} onClose={() => setScorecardOpen(false)} />
      )}
    </main>
  );
}
