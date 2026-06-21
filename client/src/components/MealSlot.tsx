import { useDroppable } from '@dnd-kit/core';
import { FoodGlyph } from './FoodGlyph';
import { computeMacros, fmt } from '../data/foods';
import type { Food, MealSlot as MealSlotType, PlanItem, MealSlotId } from '../types';

interface Macros { cal: number; protein: number; carbs: number; fat: number; }

function sharePct(value: number, total: number): number {
  if (total <= 0 || value <= 0) return 0;
  return Math.min(100, (value / total) * 100);
}

function EdgeBars({ macros, totals }: { macros: Macros; totals: Macros }) {
  return (
    <>
      <div className="slot-bar slot-bar--top"    style={{ width:  `${sharePct(macros.cal,     totals.cal)}%`,     background: 'var(--burgundy)' }} />
      <div className="slot-bar slot-bar--bottom" style={{ width:  `${sharePct(macros.protein, totals.protein)}%`, background: 'var(--nebula)' }} />
      <div className="slot-bar slot-bar--left"   style={{ height: `${sharePct(macros.carbs,   totals.carbs)}%`,   background: '#E55B1F' }} />
      <div className="slot-bar slot-bar--right"  style={{ height: `${sharePct(macros.fat,     totals.fat)}%`,     background: '#C8941A' }} />
    </>
  );
}

function SlotGlyphGrid({ items, knownFoods }: { items: PlanItem[]; knownFoods: Food[] }) {
  const count = items.length;

  if (count === 1) {
    const food = knownFoods.find((f) => f.id === items[0].foodId);
    return food ? (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FoodGlyph food={food} size={120} />
      </div>
    ) : null;
  }

  const cols = count <= 4 ? 2 : 3;
  const size = count <= 4 ? 72 : 48;
  const shown = items.slice(0, cols * cols);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 4,
      padding: 10,
      alignItems: 'center',
      justifyItems: 'center',
      alignContent: 'center',
    }}>
      {shown.map((item) => {
        const food = knownFoods.find((f) => f.id === item.foodId);
        return food ? <FoodGlyph key={item.id} food={food} size={size} /> : null;
      })}
    </div>
  );
}

// ── Inline ingredient cell (droppable swap target) ────────

function IngredientCell({ item, food, slotId, onRemove }: {
  item: PlanItem;
  food: Food;
  slotId: MealSlotId;
  onRemove: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `ingredient:${slotId}:${item.id}`,
    data: { type: 'ingredient', slotId, itemId: item.id },
  });

  const macros = computeMacros(food, item.grams);

  return (
    <div ref={setNodeRef} className={`ing-cell${isOver ? ' ing-cell--over' : ''}`}>
      <button
        className="ing-cell-remove"
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        aria-label={`Remove ${food.name.split(',')[0]}`}
      >
        <svg width={7} height={7} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
      <FoodGlyph food={food} size={36} />
      <span className="ing-cell-name">{food.name.split(',')[0]}</span>
      <span className="ing-cell-grams">{item.grams}g · {fmt.cal(macros.cal)}</span>
    </div>
  );
}

// ── Drop zone cell — add food to this meal ────────────────

function AddCell({ slotId }: { slotId: MealSlotId }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `ingpanel:${slotId}`,
    data: { type: 'slot', slotId },
  });

  return (
    <div ref={setNodeRef} className={`ing-cell ing-cell--add${isOver ? ' ing-cell--over' : ''}`}>
      <span style={{ fontSize: 18, lineHeight: 1 }}>{isOver ? '↓' : '+'}</span>
    </div>
  );
}

// ── MealSlot ──────────────────────────────────────────────

interface MealSlotProps {
  slot: MealSlotType;
  knownFoods: Food[];
  draggingFood: Food | null;
  dragGrams: number;
  dayTotals: Macros;
  isActive: boolean;
  onSelect: () => void;
  onClear: () => void;
  onRemoveIngredient: (itemId: string) => void;
}

export function MealSlot({ slot, knownFoods, draggingFood, dragGrams, dayTotals, isActive, onSelect, onClear, onRemoveIngredient }: MealSlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot:${slot.id}`,
    data: { type: 'slot', slotId: slot.id },
  });

  const isEmpty = slot.items.length === 0;

  let slotCal = 0, slotProtein = 0, slotCarbs = 0, slotFat = 0;
  for (const item of slot.items) {
    const food = knownFoods.find((f) => f.id === item.foodId);
    if (!food) continue;
    const m = computeMacros(food, item.grams);
    slotCal += m.cal; slotProtein += m.protein; slotCarbs += m.carbs; slotFat += m.fat;
  }
  const slotTotals: Macros = { cal: slotCal, protein: slotProtein, carbs: slotCarbs, fat: slotFat };

  const dragDelta = isOver && draggingFood ? computeMacros(draggingFood, dragGrams) : null;

  const showIngredients = isActive;
  const cellItems = slot.items.slice(0, 4);
  const showAddCell = slot.items.length < 4;

  return (
    <div
      className={`slot-card${isActive ? ' slot-card--active' : ''}${isOver ? ' slot-card--drag-over' : ''}`}
      onClick={onSelect}
    >
      <div ref={setNodeRef} className="slot-square">
        <EdgeBars macros={slotTotals} totals={dayTotals} />

        {isEmpty ? (
          <div className="slot-square-empty">
            <span className="slot-square-label">{slot.label}</span>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
        ) : (
          <>
            <SlotGlyphGrid items={slot.items} knownFoods={knownFoods} />
            <div className="slot-square-footer">
              <span className="slot-square-label">{slot.label}</span>
              <span className="slot-square-cal">{fmt.cal(slotTotals.cal)}</span>
            </div>
            <button
              className="slot-square-clear"
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              aria-label={`Clear ${slot.label}`}
            >
              <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </>
        )}

        {dragDelta && (
          <div className="slot-square-delta">
            <span className="slot-square-delta-cal">+{Math.round(dragDelta.cal)} cal</span>
          </div>
        )}
      </div>

      {showIngredients && (
        <div className="slot-ingredients" onClick={(e) => e.stopPropagation()}>
          <div className="slot-ing-grid">
            {cellItems.map((item) => {
              const food = knownFoods.find((f) => f.id === item.foodId);
              return food ? (
                <IngredientCell
                  key={item.id}
                  item={item}
                  food={food}
                  slotId={slot.id}
                  onRemove={() => onRemoveIngredient(item.id)}
                />
              ) : null;
            })}
            {showAddCell && <AddCell slotId={slot.id} />}
          </div>
          {slot.items.length > 4 && (
            <div className="slot-ing-overflow">+{slot.items.length - 4} more</div>
          )}
        </div>
      )}
    </div>
  );
}
