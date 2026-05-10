import { useEffect, useRef } from 'react';

type Props = {
  label: string;
  value: number;
  onChange: (delta: number) => void;
  size?: 'hero' | 'compact';
  accent?: 'gold' | 'cream';
};

export function Counter({ label, value, onChange, size = 'compact', accent = 'cream' }: Props) {
  const numRef = useRef<HTMLDivElement | null>(null);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current !== value && numRef.current) {
      numRef.current.classList.remove('counter__num--pop');
      void numRef.current.offsetWidth;
      numRef.current.classList.add('counter__num--pop');
    }
    prev.current = value;
  }, [value]);

  return (
    <div className={`counter counter--${size} counter--${accent}`}>
      <div className="counter__label eyebrow eyebrow--cream">{label}</div>
      <div className="counter__row">
        <button
          type="button"
          className="counter__btn"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(-1)}
          disabled={value <= 0}
        >
          <span aria-hidden="true">−</span>
        </button>
        <div ref={numRef} className="counter__num">
          {value}
        </div>
        <button
          type="button"
          className="counter__btn"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(1)}
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>
    </div>
  );
}
