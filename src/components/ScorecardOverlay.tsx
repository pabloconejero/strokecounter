import { useEffect } from 'react';
import type { Round } from '../state/types';
import { stablefordPoints } from '../state/scoring';

type Props = {
  round: Round;
  onClose: () => void;
};

type SectionTotals = {
  strokes: number;
  putts: number;
  points: number;
  par: number;
};

function fmt(diff: number): string {
  if (diff > 0) return `+${diff}`;
  if (diff < 0) return String(diff);
  return 'E';
}

export function ScorecardOverlay({ round, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const half = Math.ceil(round.holeCount / 2);
  const sections: { label: string; holes: typeof round.holes }[] = [
    { label: 'Out', holes: round.holes.slice(0, half) },
  ];
  if (round.holes.length > half) {
    sections.push({ label: 'In', holes: round.holes.slice(half) });
  }

  const totals: SectionTotals = { strokes: 0, putts: 0, points: 0, par: 0 };

  const renderedSections = sections.map((section) => {
    const sec: SectionTotals = { strokes: 0, putts: 0, points: 0, par: 0 };
    const rows = section.holes.map((h) => {
      const score = round.scores[h.hole] ?? { strokes: 0, putts: 0 };
      const played = score.strokes > 0;
      const points = stablefordPoints({
        strokes: score.strokes,
        par: h.par,
        strokeIndex: h.strokeIndex,
        handicap: round.handicap,
        shotsReceivedOverride: h.shotsReceivedOverride,
      });
      if (played) {
        sec.strokes += score.strokes;
        sec.putts += score.putts;
        sec.points += points;
        sec.par += h.par;
        totals.strokes += score.strokes;
        totals.putts += score.putts;
        totals.points += points;
        totals.par += h.par;
      }
      const diff = played ? score.strokes - h.par : 0;
      const diffClass = !played
        ? ''
        : diff < 0
          ? 'cell--under'
          : diff > 0
            ? 'cell--over'
            : 'cell--par';
      return (
        <tr key={h.hole} className={h.hole === round.currentHole ? 'row--current' : ''}>
          <td className="cell--hole">{h.hole}</td>
          <td className="numeric">{h.par}</td>
          <td className="numeric cell--si">{h.strokeIndex}</td>
          <td className={`numeric ${diffClass}`}>{played ? score.strokes : '—'}</td>
          <td className="numeric">{played ? score.putts : '—'}</td>
          <td className="numeric">
            {played
              ? round.playMode === 'stableford'
                ? points
                : fmt(diff)
              : '—'}
          </td>
        </tr>
      );
    });
    return (
      <tbody key={section.label}>
        {rows}
        <tr className="row--subtotal">
          <td>{section.label}</td>
          <td className="numeric">{sec.par || '—'}</td>
          <td></td>
          <td className="numeric">{sec.strokes || '—'}</td>
          <td className="numeric">{sec.putts || '—'}</td>
          <td className="numeric">
            {sec.strokes > 0
              ? round.playMode === 'stableford'
                ? sec.points
                : fmt(sec.strokes - sec.par)
              : '—'}
          </td>
        </tr>
      </tbody>
    );
  });

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Scorecard">
      <div className="overlay__backdrop" onClick={onClose} aria-hidden="true" />
      <div className="overlay__panel">
        <header className="overlay__header">
          <div>
            <div className="eyebrow">Scorecard</div>
            <h2 className="overlay__title">
              {round.holeCount} holes · {round.playMode === 'stableford' ? 'Stableford' : 'Strokes'}
            </h2>
          </div>
          <button type="button" className="overlay__close" aria-label="Close scorecard" onClick={onClose}>
            ✕
          </button>
        </header>

        <div className="scorecard">
          <table className="scorecard__table">
            <thead>
              <tr>
                <th>Hole</th>
                <th>Par</th>
                <th>SI</th>
                <th>Strokes</th>
                <th>Putts</th>
                <th>{round.playMode === 'stableford' ? 'Pts' : '±'}</th>
              </tr>
            </thead>
            {renderedSections}
            <tfoot>
              <tr className="row--total">
                <td>Total</td>
                <td className="numeric">{totals.par || '—'}</td>
                <td></td>
                <td className="numeric">{totals.strokes || '—'}</td>
                <td className="numeric">{totals.putts || '—'}</td>
                <td className="numeric">
                  {totals.strokes > 0
                    ? round.playMode === 'stableford'
                      ? totals.points
                      : fmt(totals.strokes - totals.par)
                    : '—'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
