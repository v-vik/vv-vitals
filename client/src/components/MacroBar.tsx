import type { MacroDelta } from '../types';

interface DayTotals {
  cal: number;
  protein: number;
  carbs: number;
  fat: number;
}

function Stat({ label, value, unit, delta, large }: {
  label: string;
  value: number;
  unit?: string;
  delta?: number | null;
  large?: boolean;
}) {
  const hasDelta = delta !== null && delta !== undefined && delta !== 0;
  const final = hasDelta ? Math.round(value + delta!) : null;
  return (
    <div className="mbar-stat">
      <span className="mbar-label">{label}</span>
      <div className="mbar-value-row">
        <span className={`mbar-value${large ? ' mbar-value--large' : ''}`}>
          {Math.round(value)}{unit && <span className="mbar-unit">{unit}</span>}
        </span>
        {hasDelta && (
          <>
            <span className="mbar-delta">{delta! > 0 ? '+' : ''}{Math.round(delta!)}</span>
            <span className="mbar-final">({final}{unit})</span>
          </>
        )}
      </div>
    </div>
  );
}

export function MacroBar({ totals, delta }: { totals: DayTotals; delta?: MacroDelta | null }) {
  const d = delta && (delta.cal !== 0 || delta.protein !== 0 || delta.carbs !== 0 || delta.fat !== 0)
    ? delta : null;

  return (
    <div className="macro-bar">
      <Stat label="CALORIES" value={totals.cal}     delta={d?.cal     ?? null} large />
      <div className="mbar-sep" />
      <Stat label="PROTEIN"  value={totals.protein} unit="g" delta={d?.protein ?? null} />
      <Stat label="CARBS"    value={totals.carbs}   unit="g" delta={d?.carbs   ?? null} />
      <Stat label="FAT"      value={totals.fat}     unit="g" delta={d?.fat     ?? null} />
    </div>
  );
}

export default MacroBar;
