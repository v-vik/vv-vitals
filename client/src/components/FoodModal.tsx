import { useState, useMemo, useEffect, useRef, useLayoutEffect } from 'react';
import { FoodGlyph } from './FoodGlyph';
import { Icon } from './Icon';
import { computeMacros, planTotals, fmt, snapToStep } from '../data/foods';
import type { Food, PlanGroup, MealSlotId } from '../types';

// A meal slot the user can add this food into, shown in the picker.
export interface MealOption {
  id: MealSlotId;
  label: string;
  cal: number;
  items: number;
}

interface FoodModalProps {
  food: Food;
  db: Food[];
  plan: PlanGroup[];
  onClose: () => void;
  onAdd: (args: { foodId: string; grams: number; slotId: MealSlotId }) => void;
  mealOptions: MealOption[];
  originRect: DOMRect | null;
  isFav: boolean;
  onToggleFav: () => void;
}

export function FoodModal({
  food,
  db,
  plan,
  onClose,
  onAdd,
  mealOptions,
  originRect,
  isFav,
  onToggleFav,
}: FoodModalProps) {
  const startGrams = useMemo(
    () => snapToStep(food.defaultServing ?? 100),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [food.id]
  );

  const [grams, setGrams] = useState(startGrams);
  const m = useMemo(() => computeMacros(food, grams), [food, grams]);
  const planTotalsNow = useMemo(() => planTotals(plan, db), [plan, db]);
  const dayAfter = planTotalsNow.cal + m.cal;
  const hasItems = planTotalsNow.items > 0;

  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // ESC to close + body scroll lock
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  // Origin-anchored open animation — grows from the clicked card
  useLayoutEffect(() => {
    if (!originRect || !modalRef.current) return;
    const node = modalRef.current;
    const mRect = node.getBoundingClientRect();
    const ox = originRect.left + originRect.width / 2;
    const oy = originRect.top + originRect.height / 2;
    const mx = mRect.left + mRect.width / 2;
    const my = mRect.top + mRect.height / 2;
    const dx = ox - mx;
    const dy = oy - my;
    const s = Math.min(originRect.width / mRect.width, originRect.height / mRect.height);

    node.style.animation = 'none';
    node.style.transformOrigin = 'center center';
    node.style.transform = `translate(${dx}px, ${dy}px) scale(${s})`;
    node.style.opacity = '0';
    node.style.transition = 'none';
    if (backdropRef.current) backdropRef.current.style.animation = 'none';

    void node.offsetWidth;
    node.style.transition =
      'transform 0.36s cubic-bezier(0.2, 0.85, 0.25, 1), opacity 0.22s ease-out';
    node.style.transform = 'none';
    node.style.opacity = '1';
    if (backdropRef.current) {
      backdropRef.current.style.opacity = '0';
      backdropRef.current.style.transition = 'opacity 0.22s ease-out';
      void backdropRef.current.offsetWidth;
      backdropRef.current.style.opacity = '1';
    }
  }, [originRect]);

  const handleAdd = (slotId: MealSlotId) => {
    onAdd({ foodId: food.id, grams, slotId });
  };

  return (
    <div
      ref={backdropRef}
      className="modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={modalRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <header className="modal-head">
          <div className="modal-head-row">
            <FoodGlyph food={food} size={40} />
            <div className="modal-head-text">
              <div className="modal-source">
                {food.estimated ? <em>{food.source}</em> : food.source}
              </div>
              <h3 className="modal-title" id="modal-title">{food.name}</h3>
            </div>
          </div>
          <button className="modal-close" aria-label="Close" onClick={onClose}>
            <Icon.Close size={14} />
          </button>
        </header>

        <div className="modal-meta-row">
          <span className={`badge${food.estimated ? ' nebula' : ''}`}>{food.category}</span>
          <div className="modal-meta-cal">
            Per 100g: <strong>{fmt.cal(food.cal)} cal</strong>
          </div>
        </div>

        <div className="modal-body">
          <div>
            <div className="qty-row">
              <span className="qty-label">How much are you having?</span>
              <span className="qty-value">{grams} g</span>
            </div>
            <div className="slider-wrap" style={{ marginTop: 10 }}>
              <input
                type="range"
                className="slider"
                min={25}
                max={500}
                step={25}
                value={grams}
                onChange={(e) => setGrams(parseInt(e.target.value))}
                aria-label="Serving size in grams"
              />
              <div className="slider-bounds">
                <span>25g</span>
                <span>500g</span>
              </div>
            </div>
          </div>

          <div className={`macros-grid${m.caffeine > 0 ? ' macros-grid--five' : ''}`}>
            <div className="macro-card">
              <div className="macro-label">Calories</div>
              <div className="macro-value">{fmt.cal(m.cal)}</div>
            </div>
            <div className="macro-card">
              <div className="macro-label">Protein</div>
              <div className="macro-value">{fmt.g(m.protein)}<span className="unit">g</span></div>
            </div>
            <div className="macro-card">
              <div className="macro-label">Carbs</div>
              <div className="macro-value">{fmt.g(m.carbs)}<span className="unit">g</span></div>
            </div>
            <div className="macro-card">
              <div className="macro-label">Fat</div>
              <div className="macro-value">{fmt.g(m.fat)}<span className="unit">g</span></div>
            </div>
            {m.caffeine > 0 && (
              <div className="macro-card macro-card--caffeine">
                <div className="macro-label">Caffeine</div>
                <div className="macro-value">{Math.round(m.caffeine)}<span className="unit">mg</span></div>
              </div>
            )}
          </div>

          {hasItems && (
            <div className="info-row">
              <span className="label">Day total after adding</span>
              <span className="value">{fmt.cal(dayAfter)} cal</span>
            </div>
          )}

          <div className="meal-picker">
            <div className="meal-picker-label">Add to which meal?</div>
            <div className="meal-picker-grid">
              {mealOptions.map((meal) => (
                <button
                  key={meal.id}
                  className="meal-pick-btn"
                  onClick={() => handleAdd(meal.id)}
                >
                  <Icon.Hexagon size={12} />
                  <span className="meal-pick-name">{meal.label}</span>
                  <span className="meal-pick-cal">
                    {meal.items === 0 ? 'empty' : `${fmt.cal(meal.cal)} cal`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onToggleFav}>
              <Icon.Heart size={13} filled={isFav} />
              {isFav ? 'Saved' : 'Save to favourites'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FoodModal;
