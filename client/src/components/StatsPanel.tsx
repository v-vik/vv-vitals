import type { MacroDelta } from '../types';
import { fmt } from '../data/foods';

interface DayTotals {
  cal: number;
  protein: number;
  carbs: number;
  fat: number;
}

function StatBar({ label, value, delta }: {
  label: string;
  value: number;
  delta: number | null;
}) {
  const rounded = Math.round(value);
  const hasDelta = delta !== null && delta !== 0;
  const final = hasDelta ? Math.round(value + delta!) : null;

  return (
    <div className="stats-row">
      <span className="stats-row-label">{label}</span>
      <div className="stats-value-row">
        <span className="stats-row-value">
          {rounded}<span className="stats-unit">g</span>
        </span>
        {hasDelta && (
          <>
            <span className="delta-amount">
              {delta! > 0 ? '+' : ''}{Math.round(delta!)}
            </span>
            <span className="delta-final">({final}g)</span>
          </>
        )}
      </div>
    </div>
  );
}

export function StatsPanel({ totals, delta }: { totals: DayTotals; delta?: MacroDelta | null }) {
  const hasDelta = !!(delta && (delta.cal !== 0 || delta.protein !== 0 || delta.carbs !== 0 || delta.fat !== 0));
  const finalCal = hasDelta ? Math.round(totals.cal + delta!.cal) : null;

  return (
    <div className="stats-panel">
      <div className="stats-panel-inner">
        <div className="stats-light">
          <span className="stats-light-label">CALORIES</span>
          <span className="stats-light-value">{fmt.cal(totals.cal)}</span>
          {hasDelta && (
            <div className="stats-cal-delta">
              <span className="delta-amount delta-amount--cal">
                {delta!.cal > 0 ? '+' : ''}{Math.round(delta!.cal)}
              </span>
              <span className="delta-final delta-final--cal">({fmt.cal(finalCal!)})</span>
            </div>
          )}
        </div>

        <div className="stats-sep" />

        <StatBar label="PROTEIN" value={totals.protein} delta={hasDelta ? delta!.protein : null} />
        <StatBar label="CARBS"   value={totals.carbs}   delta={hasDelta ? delta!.carbs   : null} />
        <StatBar label="FAT"     value={totals.fat}     delta={hasDelta ? delta!.fat     : null} />
      </div>
    </div>
  );
}

export default StatsPanel;
