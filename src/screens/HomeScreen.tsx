import type { Round } from '../state/types';
import { roundTotals } from '../state/scoring';

type Props = {
  inProgress: Round | null;
  historyCount: number;
  onContinue: () => void;
  onStart: () => void;
};

export function HomeScreen({ inProgress, historyCount, onContinue, onStart }: Props) {
  const totals = inProgress ? roundTotals(inProgress) : null;

  return (
    <main className="screen screen--home">
      <div className="home__crest" aria-hidden="true">
        <svg viewBox="0 0 100 100" width="64" height="64">
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.6" />
          <text
            x="50"
            y="56"
            textAnchor="middle"
            fontFamily="Fraunces, serif"
            fontSize="34"
            fontStyle="italic"
            fill="currentColor"
          >
            S
          </text>
          <line x1="50" y1="6" x2="50" y2="14" stroke="currentColor" strokeWidth="1" />
          <line x1="50" y1="86" x2="50" y2="94" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      <div className="home__title">
        <div className="eyebrow eyebrow--cream">Est. for the round</div>
        <h1 className="home__heading">
          Stroke<span className="home__amp"> & </span>Putt
          <span className="home__sub">— a counter for your card —</span>
        </h1>
      </div>

      <div className="home__actions">
        {inProgress && totals && (
          <button type="button" className="btn btn--primary" onClick={onContinue}>
            <span className="btn__eyebrow">Continue round</span>
            <span className="btn__title">
              Hole {inProgress.currentHole}{' '}
              <span className="btn__faint">of {inProgress.holeCount}</span>
            </span>
            <span className="btn__detail numeric">
              {totals.strokes} strokes · {totals.putts} putts ·{' '}
              {inProgress.playMode === 'stableford'
                ? `${totals.points} pts`
                : totals.vsPar > 0
                  ? `+${totals.vsPar}`
                  : totals.vsPar < 0
                    ? totals.vsPar
                    : 'E'}
            </span>
          </button>
        )}
        <button
          type="button"
          className={inProgress ? 'btn btn--ghost' : 'btn btn--primary'}
          onClick={() => {
            if (
              inProgress &&
              !window.confirm('Starting a new round will replace the round currently in progress. Continue?')
            ) {
              return;
            }
            onStart();
          }}
        >
          <span className="btn__eyebrow">{inProgress ? 'Or' : 'Tee off'}</span>
          <span className="btn__title">Start a new round</span>
          <span className="btn__detail">9 or 18 · Strokes or Stableford</span>
        </button>
      </div>

      <footer className="home__footer">
        <div className="rule" />
        <div className="home__meta numeric">
          {historyCount > 0 ? `${historyCount} round${historyCount === 1 ? '' : 's'} in the book` : 'No rounds in the book yet'}
        </div>
      </footer>
    </main>
  );
}
