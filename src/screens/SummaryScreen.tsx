import { useState } from 'react';
import type { Round } from '../state/types';
import { roundTotals } from '../state/scoring';
import { ScorecardOverlay } from '../components/ScorecardOverlay';

type Props = {
  round: Round;
  onSave: () => void;
  onDiscard: () => void;
};

export function SummaryScreen({ round, onSave, onDiscard }: Props) {
  const [scorecardOpen, setScorecardOpen] = useState(false);
  const t = roundTotals(round);
  const dateStr = new Date(round.completedAt ?? round.startedAt).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="screen screen--summary">
      <div className="cert">
        <div className="cert__rule cert__rule--top" aria-hidden="true" />
        <div className="eyebrow">Round complete</div>
        <h1 className="cert__title">
          <em>Card,</em> signed.
        </h1>
        <div className="cert__date">{dateStr}</div>

        <div className="cert__statsGrid">
          <div className="stat">
            <div className="stat__label eyebrow">Strokes</div>
            <div className="stat__value numeric">{t.strokes}</div>
          </div>
          <div className="stat">
            <div className="stat__label eyebrow">Putts</div>
            <div className="stat__value numeric">{t.putts}</div>
          </div>
          {round.playMode === 'stableford' ? (
            <div className="stat stat--accent">
              <div className="stat__label eyebrow">Points</div>
              <div className="stat__value numeric">{t.points}</div>
            </div>
          ) : (
            <div className="stat stat--accent">
              <div className="stat__label eyebrow">vs Par</div>
              <div className="stat__value numeric">
                {t.vsPar > 0 ? `+${t.vsPar}` : t.vsPar < 0 ? t.vsPar : 'E'}
              </div>
            </div>
          )}
        </div>

        <div className="cert__line numeric">
          {round.holeCount} holes · {round.playMode === 'stableford' ? 'Stableford' : 'Strokes'} · HCP{' '}
          {round.handicap}
        </div>

        <button type="button" className="link cert__cardLink" onClick={() => setScorecardOpen(true)}>
          See full scorecard →
        </button>

        <div className="cert__actions">
          <button type="button" className="btn btn--ghost" onClick={onDiscard}>
            Discard
          </button>
          <button type="button" className="btn btn--primary" onClick={onSave}>
            <span className="btn__title">Save & finish</span>
          </button>
        </div>
        <div className="cert__rule cert__rule--bottom" aria-hidden="true" />
      </div>

      {scorecardOpen && (
        <ScorecardOverlay round={round} onClose={() => setScorecardOpen(false)} />
      )}
    </main>
  );
}
