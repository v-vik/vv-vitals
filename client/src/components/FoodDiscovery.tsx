import { useDraggable } from '@dnd-kit/core';
import { FoodGlyph } from './FoodGlyph';
import { Icon } from './Icon';
import { fmt } from '../data/foods';
import type { Food } from '../types';

// ── Macro ratio bar ───────────────────────────────────────

function MacroRatioBar({ protein = 0, carbs = 0, fat = 0 }: { protein?: number; carbs?: number; fat?: number }) {
  const total = protein + carbs + fat;
  if (total <= 0) return null;
  const pp = (protein / total) * 100;
  const cp = (carbs / total) * 100;
  return (
    <div className="macro-ratio" role="img" aria-label={`P${protein}g C${carbs}g F${fat}g`}>
      <div className="macro-ratio-fill" style={{ width: '100%' }}>
        <span className="macro-ratio-seg seg-p" style={{ width: `${pp}%` }} />
        <span className="macro-ratio-seg seg-c" style={{ width: `${cp}%` }} />
        <span className="macro-ratio-seg seg-f" style={{ width: `${100 - pp - cp}%` }} />
      </div>
    </div>
  );
}

// ── Hero card — the top result, large and draggable ───────

function HeroCard({ food, isFav, onToggleFav }: { food: Food; isFav: boolean; onToggleFav: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: food.id,
    data: { food },
  });

  return (
    <div
      ref={setNodeRef}
      className={`hero-food-card${isDragging ? ' dragging' : ''}`}
      {...listeners}
      {...attributes}
    >
      <div className="hero-food-glyph">
        <FoodGlyph food={food} size={96} />
      </div>

      <div className="hero-food-body">
        <div className="hero-food-top-row">
          <span className="hero-food-cat">{food.estimated ? 'AI estimate' : food.category}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="hero-drag-hint">← drag to a meal</span>
            <button
              className={`fav-btn${isFav ? ' fav-btn--active' : ''}`}
              onClick={(e) => { e.stopPropagation(); onToggleFav(); }}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label={isFav ? 'Remove from vault' : 'Save to vault'}
            >
              <Icon.Bookmark size={13} filled={isFav} />
            </button>
          </div>
        </div>

        <h2 className="hero-food-name">{food.name}</h2>
        <div className="hero-food-source">{food.source}</div>

        <div className="hero-food-macros">
          <div className="hero-macro hero-macro--cal">
            <span className="hero-macro-val">{fmt.cal(food.cal)}</span>
            <span className="hero-macro-lbl">cal</span>
          </div>
          <div className="hero-macro-divider" />
          <div className="hero-macro">
            <span className="hero-macro-val">{fmt.g(food.protein)}<span className="unit">g</span></span>
            <span className="hero-macro-lbl">protein</span>
          </div>
          <div className="hero-macro">
            <span className="hero-macro-val">{fmt.g(food.carbs)}<span className="unit">g</span></span>
            <span className="hero-macro-lbl">carbs</span>
          </div>
          <div className="hero-macro">
            <span className="hero-macro-val">{fmt.g(food.fat)}<span className="unit">g</span></span>
            <span className="hero-macro-lbl">fat</span>
          </div>
        </div>

        <div className="hero-per100g">per 100g</div>
        <MacroRatioBar protein={food.protein} carbs={food.carbs} fat={food.fat} />
      </div>
    </div>
  );
}

// ── Alt card — compact draggable row ─────────────────────

function AltCard({ food, isFav, onToggleFav }: { food: Food; isFav: boolean; onToggleFav: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: food.id,
    data: { food },
  });

  return (
    <div
      ref={setNodeRef}
      className={`alt-food-card${isDragging ? ' dragging' : ''}`}
      {...listeners}
      {...attributes}
    >
      <FoodGlyph food={food} size={32} />
      <div className="alt-food-info">
        <span className="alt-food-name">{food.name.split(',')[0]}</span>
        <span className="alt-food-source">{food.source}</span>
      </div>
      <div className="alt-food-macros">
        <span className="alt-mac alt-mac--cal">{fmt.cal(food.cal)} cal</span>
        <span className="alt-mac">P{fmt.g(food.protein)}g</span>
        <span className="alt-mac">C{fmt.g(food.carbs)}g</span>
        <span className="alt-mac">F{fmt.g(food.fat)}g</span>
      </div>
      <button
        className={`fav-btn${isFav ? ' fav-btn--active' : ''}`}
        onClick={(e) => { e.stopPropagation(); onToggleFav(); }}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label={isFav ? 'Remove from vault' : 'Save to vault'}
      >
        <Icon.Bookmark size={12} filled={isFav} />
      </button>
    </div>
  );
}

// ── FoodDiscovery ─────────────────────────────────────────

interface FoodDiscoveryProps {
  results: Food[];
  query: string;
  searching?: boolean;
  favourites: string[];
  onToggleFav: (id: string) => void;
}

export function FoodDiscovery({ results, query, searching, favourites, onToggleFav }: FoodDiscoveryProps) {
  if (searching) {
    return (
      <div className="discovery-state">
        <span className="pulse">Searching Open Food Facts…</span>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="discovery-state">
        {query.trim() ? (
          <span>No results for <em>"{query.trim()}"</em> — try AI describe above.</span>
        ) : (
          <span>Search for a food, or describe a meal with AI above.</span>
        )}
      </div>
    );
  }

  const [hero, ...alts] = results;

  return (
    <div className="discovery">
      <HeroCard
        food={hero}
        isFav={favourites.includes(hero.id)}
        onToggleFav={() => onToggleFav(hero.id)}
      />

      {alts.length > 0 && (
        <div className="discovery-alts">
          <div className="discovery-alts-label">Alternatives</div>
          {alts.map((food) => (
            <AltCard
              key={food.id}
              food={food}
              isFav={favourites.includes(food.id)}
              onToggleFav={() => onToggleFav(food.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default FoodDiscovery;
