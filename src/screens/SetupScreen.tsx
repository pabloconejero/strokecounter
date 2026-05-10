import { useMemo, useState } from 'react';
import type { HoleConfig, HoleCount, PlayMode, Round } from '../state/types';
import { defaultHoles, shotsReceived } from '../state/scoring';
import { createRound } from '../state/round';

type Props = {
  onCancel: () => void;
  onStart: (round: Round) => void;
};

export function SetupScreen({ onCancel, onStart }: Props) {
  const [holeCount, setHoleCount] = useState<HoleCount>(18);
  const [playMode, setPlayMode] = useState<PlayMode>('stableford');
  const [handicap, setHandicap] = useState<number>(18);
  const [holes, setHoles] = useState<HoleConfig[]>(() => defaultHoles(18));

  const updateCount = (next: HoleCount) => {
    setHoleCount(next);
    setHoles(defaultHoles(next));
  };

  const updateHole = (idx: number, patch: Partial<HoleConfig>) => {
    setHoles((prev) => prev.map((h, i) => (i === idx ? { ...h, ...patch } : h)));
  };

  /** When handicap changes, clear any overrides so they recompute from new handicap. */
  const updateHandicap = (val: number) => {
    setHandicap(val);
    setHoles((prev) =>
      prev.map((h) => {
        const { shotsReceivedOverride: _, ...rest } = h;
        return rest;
      }),
    );
  };

  const setHcpOverride = (idx: number, delta: number) => {
    setHoles((prev) =>
      prev.map((h, i) => {
        if (i !== idx) return h;
        const computed = shotsReceived(h.strokeIndex, handicap);
        const current = h.shotsReceivedOverride ?? computed;
        const next = Math.max(0, current + delta);
        return { ...h, shotsReceivedOverride: next === computed ? undefined : next };
      }),
    );
  };

  const siValid = useMemo(() => {
    const seen = new Set<number>();
    for (const h of holes) {
      if (h.strokeIndex < 1 || h.strokeIndex > holeCount) return false;
      if (seen.has(h.strokeIndex)) return false;
      seen.add(h.strokeIndex);
    }
    return true;
  }, [holes, holeCount]);

  const totalPar = holes.reduce((s, h) => s + h.par, 0);

  const submit = () => {
    if (!siValid) return;
    const round = createRound({ holeCount, playMode, handicap, holes });
    onStart(round);
  };

  return (
    <main className="screen screen--setup">
      <header className="setup__header">
        <button type="button" className="link" onClick={onCancel}>
          ← Back
        </button>
        <div className="eyebrow eyebrow--cream">New round · Set the card</div>
      </header>

      <h1 className="setup__title">
        <em>Mark</em> your card
      </h1>

      <section className="card setup__pick">
        <div className="setup__pickRow">
          <div className="eyebrow">Holes</div>
          <div className="seg">
            <button
              type="button"
              className={`seg__btn ${holeCount === 9 ? 'seg__btn--on' : ''}`}
              onClick={() => updateCount(9)}
            >
              9
            </button>
            <button
              type="button"
              className={`seg__btn ${holeCount === 18 ? 'seg__btn--on' : ''}`}
              onClick={() => updateCount(18)}
            >
              18
            </button>
          </div>
        </div>

        <div className="setup__pickRow">
          <div className="eyebrow">Play mode</div>
          <div className="seg">
            <button
              type="button"
              className={`seg__btn ${playMode === 'strokes' ? 'seg__btn--on' : ''}`}
              onClick={() => setPlayMode('strokes')}
            >
              Strokes
            </button>
            <button
              type="button"
              className={`seg__btn ${playMode === 'stableford' ? 'seg__btn--on' : ''}`}
              onClick={() => setPlayMode('stableford')}
            >
              Stableford
            </button>
          </div>
        </div>

        <div className="setup__pickRow">
          <div className="eyebrow">Handicap</div>
          <div className="numField">
            <button
              type="button"
              className="numField__btn"
              aria-label="Decrease handicap"
              onClick={() => updateHandicap(Math.max(0, handicap - 1))}
            >
              −
            </button>
            <input
              type="number"
              inputMode="numeric"
              className="numField__input numeric"
              value={handicap}
              min={0}
              max={54}
              onChange={(e) =>
                updateHandicap(Math.max(0, Math.min(54, Number(e.target.value) || 0)))
              }
            />
            <button
              type="button"
              className="numField__btn"
              aria-label="Increase handicap"
              onClick={() => updateHandicap(Math.min(54, handicap + 1))}
            >
              +
            </button>
          </div>
        </div>
      </section>

      <section className="card setup__holes">
        <div className="setup__holesHeader">
          <div className="eyebrow">Card · Par {totalPar}</div>
          {!siValid && (
            <div className="setup__warn">Stroke indexes must be unique 1–{holeCount}.</div>
          )}
        </div>
        <div className="holeGrid holeGrid--4">
          <div className="holeGrid__head numeric">Hole</div>
          <div className="holeGrid__head">Par</div>
          <div className="holeGrid__head">SI</div>
          <div className="holeGrid__head">HCP shots</div>
          {holes.map((h, idx) => {
            const computed = shotsReceived(h.strokeIndex, handicap);
            const effective = h.shotsReceivedOverride ?? computed;
            const isOverridden = h.shotsReceivedOverride !== undefined;
            return (
              <div key={h.hole} className="holeGrid__row">
                <div className="holeGrid__cell holeGrid__cell--hole numeric">{h.hole}</div>
                <div className="holeGrid__cell">
                  <div className="seg seg--small">
                    {[3, 4, 5].map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={`seg__btn ${h.par === p ? 'seg__btn--on' : ''}`}
                        onClick={() => updateHole(idx, { par: p })}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="holeGrid__cell">
                  <select
                    className="select numeric"
                    value={h.strokeIndex}
                    onChange={(e) =>
                      updateHole(idx, { strokeIndex: Number(e.target.value), shotsReceivedOverride: undefined })
                    }
                  >
                    {Array.from({ length: holeCount }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="holeGrid__cell hcpCell">
                  <button
                    type="button"
                    className="hcpCell__btn"
                    aria-label={`Decrease HCP shots for hole ${h.hole}`}
                    onClick={() => setHcpOverride(idx, -1)}
                    disabled={effective <= 0}
                  >
                    −
                  </button>
                  <span className={`hcpCell__val numeric ${isOverridden ? 'hcpCell__val--override' : ''}`}>
                    {effective}
                    {isOverridden && (
                      <button
                        type="button"
                        className="hcpCell__reset"
                        aria-label="Reset HCP shots to computed value"
                        onClick={() => updateHole(idx, { shotsReceivedOverride: undefined })}
                        title={`Computed: ${computed}`}
                      >
                        ↺
                      </button>
                    )}
                  </span>
                  <button
                    type="button"
                    className="hcpCell__btn"
                    aria-label={`Increase HCP shots for hole ${h.hole}`}
                    onClick={() => setHcpOverride(idx, 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="setup__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={submit}
          disabled={!siValid}
        >
          <span className="btn__title">Tee off</span>
        </button>
      </div>
    </main>
  );
}
