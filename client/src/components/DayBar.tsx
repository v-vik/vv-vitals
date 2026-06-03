import type { MacroDelta } from '../types';
import { fmt } from '../data/foods';

interface DayTotals {
  cal: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DayBarProps {
  totals: DayTotals;
  delta: MacroDelta | null;
}

function DeltaChip({ label, value }: { label: string; value: number }) {
  if (Math.abs(value) < 0.5) return null;
  const cls = value > 0 ? 'pos' : 'neg';
  const sign = value > 0 ? '+' : '';
  return (
    <span className={`delta-chip ${cls}`}>
      {sign}{Math.round(value)}{label}
    </span>
  );
}

export function DayBar({ totals, delta }: DayBarProps) {
  const hasDelta = delta !== null && (
    Math.abs(delta.cal) > 0.5 ||
    Math.abs(delta.protein) > 0.5 ||
    Math.abs(delta.carbs) > 0.5 ||
    Math.abs(delta.fat) > 0.5
  );

  return (
    <div className="day-bar">
      <div className="day-bar-inner">
        <span className="day-bar-label">Day total</span>

        <div className="day-bar-stats">
          <div className="day-bar-stat day-bar-stat--cal">
            <span className="day-bar-stat-label">Cal</span>
            <span className="day-bar-stat-value">
              {fmt.cal(totals.cal)}
              {hasDelta && delta && Math.abs(delta.cal) > 0.5 && (
                <span style={{ fontSize: 11, marginLeft: 6, color: delta.cal > 0 ? '#7EC8A0' : 'var(--rose)', fontWeight: 400 }}>
                  {delta.cal > 0 ? '+' : ''}{Math.round(delta.cal)}
                </span>
              )}
            </span>
          </div>

          <div className="day-bar-divider" />

          <div className="day-bar-stat">
            <span className="day-bar-stat-label">Protein</span>
            <span className="day-bar-stat-value">
              {fmt.g(totals.protein)}
              <span className="unit">g</span>
              {hasDelta && delta && Math.abs(delta.protein) > 0.5 && (
                <span style={{ fontSize: 11, marginLeft: 6, color: delta.protein > 0 ? '#7EC8A0' : 'var(--rose)', fontWeight: 400 }}>
                  {delta.protein > 0 ? '+' : ''}{Math.round(delta.protein)}
                </span>
              )}
            </span>
          </div>

          <div className="day-bar-stat">
            <span className="day-bar-stat-label">Carbs</span>
            <span className="day-bar-stat-value">
              {fmt.g(totals.carbs)}
              <span className="unit">g</span>
              {hasDelta && delta && Math.abs(delta.carbs) > 0.5 && (
                <span style={{ fontSize: 11, marginLeft: 6, color: delta.carbs > 0 ? '#7EC8A0' : 'var(--rose)', fontWeight: 400 }}>
                  {delta.carbs > 0 ? '+' : ''}{Math.round(delta.carbs)}
                </span>
              )}
            </span>
          </div>

          <div className="day-bar-stat">
            <span className="day-bar-stat-label">Fat</span>
            <span className="day-bar-stat-value">
              {fmt.g(totals.fat)}
              <span className="unit">g</span>
              {hasDelta && delta && Math.abs(delta.fat) > 0.5 && (
                <span style={{ fontSize: 11, marginLeft: 6, color: delta.fat > 0 ? '#7EC8A0' : 'var(--rose)', fontWeight: 400 }}>
                  {delta.fat > 0 ? '+' : ''}{Math.round(delta.fat)}
                </span>
              )}
            </span>
          </div>
        </div>

        {hasDelta && delta && (
          <div className="day-bar-delta">
            <DeltaChip label=" cal" value={delta.cal} />
            <DeltaChip label="P" value={delta.protein} />
            <DeltaChip label="C" value={delta.carbs} />
            <DeltaChip label="F" value={delta.fat} />
          </div>
        )}
      </div>
    </div>
  );
}
