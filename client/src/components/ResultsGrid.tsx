import { useMemo, useState } from 'react';
import { FoodGlyph } from './FoodGlyph';
import { fmt } from '../data/foods';
import type { Food, SortKey, ViewMode } from '../types';

// ── Macro ratio bar ──────────────────────────────────────
interface MacroRatioBarProps {
  protein?: number;
  carbs?: number;
  fat?: number;
  maxGrams?: number;
}

function MacroRatioBar({ protein = 0, carbs = 0, fat = 0, maxGrams = 50 }: MacroRatioBarProps) {
  const total = protein + carbs + fat;
  if (total <= 0) return null;

  // Log-scale fill so dense foods don't completely dominate
  const denom = Math.log(1 + Math.max(1, maxGrams));
  const fill = denom > 0 ? Math.max(0, Math.min(1, Math.log(1 + total) / denom)) : 0;
  const pp = (protein / total) * 100;
  const cp = (carbs / total) * 100;

  return (
    <div
      className="macro-ratio"
      role="img"
      aria-label={`Per 100g — ${protein}g protein, ${carbs}g carbs, ${fat}g fat`}
    >
      <div className="macro-ratio-fill" style={{ width: `${fill * 100}%` }}>
        <span className="macro-ratio-seg seg-p" style={{ width: `${pp}%` }} />
        <span className="macro-ratio-seg seg-c" style={{ width: `${cp}%` }} />
        <span className="macro-ratio-seg seg-f" style={{ width: `${100 - pp - cp}%` }} />
      </div>
    </div>
  );
}

// ── Food card ────────────────────────────────────────────
interface FoodCardProps {
  food: Food;
  onClick: (rect: DOMRect) => void;
  maxGrams: number;
}

function FoodCard({ food, onClick, maxGrams }: FoodCardProps) {
  return (
    <button
      className={`food-card${food.estimated ? ' ai' : ''}`}
      onClick={(e) => onClick(e.currentTarget.getBoundingClientRect())}
    >
      <header className="food-card-top">
        <span className="food-card-cat">
          {food.estimated ? 'AI · ' : ''}
          {food.category}
        </span>
        <span className="food-card-source food-card-source--top">
          {food.estimated ? <em>{food.source}</em> : food.source}
        </span>
      </header>

      <div className="food-card-hero">
        <FoodGlyph food={food} size={88} />
      </div>

      <h4 className="food-card-name">{food.name}</h4>

      <footer className="food-card-foot">
        <div className="food-card-foot-row">
          <span className="food-card-cal">
            {fmt.cal(food.cal)}
            <span className="unit">CAL</span>
          </span>
          <span className="food-card-per">per 100g</span>
        </div>
        <div className="food-card-macros">
          <span className="food-card-macro">
            <i className="dot dot-p" />P<strong>{fmt.g(food.protein)}g</strong>
          </span>
          <span className="food-card-macro">
            <i className="dot dot-c" />C<strong>{fmt.g(food.carbs)}g</strong>
          </span>
          <span className="food-card-macro">
            <i className="dot dot-f" />F<strong>{fmt.g(food.fat)}g</strong>
          </span>
        </div>
        <MacroRatioBar protein={food.protein} carbs={food.carbs} fat={food.fat} maxGrams={maxGrams} />
      </footer>

      <span className="food-card-add" aria-hidden="true">
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </span>
    </button>
  );
}

// ── Sort options ─────────────────────────────────────────
const SORT_OPTIONS: { id: SortKey; label: string; key: keyof Food | null }[] = [
  { id: 'default',  label: 'Default',  key: null },
  { id: 'protein',  label: 'Protein',  key: 'protein' },
  { id: 'carbs',    label: 'Carbs',    key: 'carbs' },
  { id: 'fat',      label: 'Fat',      key: 'fat' },
  { id: 'cal',      label: 'Calories', key: 'cal' },
];

// ── Results grid ─────────────────────────────────────────
interface ResultsGridProps {
  db: Food[];
  query: string;
  view: ViewMode;
  favourites: string[];
  onPickFood: (food: Food, rect: DOMRect) => void;
}

export function ResultsGrid({ db, query, view, favourites, onPickFood }: ResultsGridProps) {
  const [sort, setSort] = useState<SortKey>('default');

  const maxGrams = useMemo(() => {
    let m = 1;
    for (const f of db) {
      const t = (f.protein ?? 0) + (f.carbs ?? 0) + (f.fat ?? 0);
      if (t > m) m = t;
    }
    return m;
  }, [db]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const favSet = new Set(favourites);

    const filtered = db.filter((f) => {
      if (view === 'drink' && f.category !== 'Beverage') return false;
      if (view === 'food' && f.category === 'Beverage') return false;
      if (view === 'favourite' && !favSet.has(f.id)) return false;
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.source.toLowerCase().includes(q)
      );
    });

    const opt = SORT_OPTIONS.find((o) => o.id === sort);
    if (!opt?.key) return filtered;
    const k = opt.key as keyof Food;
    return [...filtered].sort((a, b) => ((b[k] as number) ?? 0) - ((a[k] as number) ?? 0));
  }, [db, query, view, favourites, sort]);

  const headline = query.trim()
    ? `Results for "${query.trim()}"`
    : view === 'drink'
    ? 'Drinks'
    : view === 'favourite'
    ? 'Your favourites'
    : 'Suggested for you';

  const activeSort = SORT_OPTIONS.find((o) => o.id === sort) ?? SORT_OPTIONS[0];

  return (
    <section>
      <div className="results-headline">
        <h2 className="results-headline-title">{headline}</h2>
        <div className="results-headline-right">
          <div className="sort-by" role="group" aria-label="Sort results by">
            <span className="sort-by-label">Sort by</span>
            <div className="sort-by-options">
              {SORT_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  className={`sort-by-opt${sort === o.id ? ' is-active' : ''}`}
                  onClick={() => setSort(o.id)}
                  aria-pressed={sort === o.id}
                  type="button"
                >
                  {o.label}
                </button>
              ))}
            </div>
            {activeSort.key && (
              <span className="sort-by-suffix">per 100g, high → low</span>
            )}
          </div>
          <span className="results-headline-meta">
            {results.length} {results.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>

      <div className="food-grid">
        {results.length === 0 ? (
          <div className="grid-empty">
            <strong>{view === 'favourite' ? 'No favourites yet' : 'No matches'}</strong>
            {view === 'favourite'
              ? 'Tap the heart in any food modal to pin it here.'
              : 'Try a different term, or describe what you ate using AI above.'}
          </div>
        ) : (
          results.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              onClick={(rect) => onPickFood(food, rect)}
              maxGrams={maxGrams}
            />
          ))
        )}
      </div>
    </section>
  );
}

export default ResultsGrid;
