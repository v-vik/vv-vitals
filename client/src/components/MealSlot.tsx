import { useDroppable } from '@dnd-kit/core';
import { FoodGlyph } from './FoodGlyph';
import { computeMacros } from '../data/foods';
import type { Food, MealSlot as MealSlotType, MealSlotId, PlanItem, MacroDelta } from '../types';

// ── Bar scale — value as share of a total ─────────────────
function sharePct(value: number, total: number): number {
  if (total <= 0 || value <= 0) return 0;
  return Math.min(100, (value / total) * 100);
}

interface Macros { cal: number; protein: number; carbs: number; fat: number; }

// ── Shared edge bar renderer ──────────────────────────────

function EdgeBars({ macros, totals }: { macros: Macros; totals: Macros }) {
  const calPct  = sharePct(macros.cal,     totals.cal);
  const protPct = sharePct(macros.protein, totals.protein);
  const carbPct = sharePct(macros.carbs,   totals.carbs);
  const fatPct  = sharePct(macros.fat,     totals.fat);

  return (
    <>
      <div className="slot-bar slot-bar--top"    style={{ width:  `${calPct}%`,  background: 'var(--burgundy)' }} />
      <div className="slot-bar slot-bar--bottom" style={{ width:  `${protPct}%`, background: 'var(--nebula)' }} />
      <div className="slot-bar slot-bar--left"   style={{ height: `${carbPct}%`, background: '#E55B1F' }} />
      <div className="slot-bar slot-bar--right"  style={{ height: `${fatPct}%`,  background: '#C8941A' }} />
    </>
  );
}

// ── Delta chip ────────────────────────────────────────────

interface DeltaChipProps { label: string; value: number; }

function DeltaChip({ label, value }: DeltaChipProps) {
  if (Math.abs(value) < 0.5) return null;
  const cls = value > 0 ? 'pos' : 'neg';
  const sign = value > 0 ? '+' : '';
  return (
    <span className={`delta-chip ${cls}`}>
      {sign}{Math.round(value)}{label}
    </span>
  );
}

// ── Glyph collage inside the slot ────────────────────────

function SlotGlyphGrid({ items, knownFoods }: { items: PlanItem[]; knownFoods: Food[] }) {
  const count = items.length;

  if (count === 1) {
    const food = knownFoods.find((f) => f.id === items[0].foodId);
    return food ? (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
        <FoodGlyph food={food} size={64} />
      </div>
    ) : null;
  }

  const cols = count <= 4 ? 2 : 3;
  const size = count <= 4 ? 36 : 24;
  const shown = items.slice(0, cols * cols);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 4,
      padding: 10,
      width: '100%',
      height: '100%',
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

// ── Droppable ingredient cell ─────────────────────────────

function IngredientCell({ item, food, slotId, slotTotals, onRemove }: {
  item: PlanItem;
  food: Food;
  slotId: MealSlotId;
  slotTotals: Macros;
  onRemove: (itemId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `ingredient:${slotId}:${item.id}`,
    data: { type: 'ingredient', slotId, itemId: item.id },
  });

  const macros = computeMacros(food, item.grams);

  return (
    <div
      ref={setNodeRef}
      className={`ingredient-cell${isOver ? ' ingredient-cell--drag-over' : ''}`}
      title={food.name.split(',')[0]}
    >
      <EdgeBars macros={macros} totals={slotTotals} />
      <FoodGlyph food={food} size={22} />
      <button
        className="ingredient-cell-remove"
        onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
        aria-label={`Remove ${food.name.split(',')[0]}`}
      >
        <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ── Main MealSlot component ───────────────────────────────

interface MealSlotProps {
  slot: MealSlotType;
  knownFoods: Food[];
  draggingFood: Food | null;
  dragGrams: number;
  dayTotals: Macros;
  expanded: boolean;
  onToggle: () => void;
  onRemove: (itemId: string) => void;
  onClear: () => void;
}

export function MealSlot({ slot, knownFoods, draggingFood, dragGrams, dayTotals, expanded, onToggle, onRemove, onClear }: MealSlotProps) {

  const slotDropId = `slot:${slot.id}`;
  const { setNodeRef: setSlotRef, isOver: isSlotOver } = useDroppable({
    id: slotDropId,
    data: { type: 'slot', slotId: slot.id },
  });

  const isEmpty = slot.items.length === 0;

  let slotDelta: MacroDelta | null = null;
  if (isSlotOver && draggingFood) {
    const m = computeMacros(draggingFood, dragGrams);
    slotDelta = { cal: m.cal, protein: m.protein, carbs: m.carbs, fat: m.fat };
  }

  // ── Empty view ────────────────────────────────
  if (isEmpty) {
    return (
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div ref={setSlotRef} className={`meal-slot${isSlotOver ? ' meal-slot--drag-over' : ''}`}>
          <div className="meal-slot-empty">
            <div className="meal-slot-empty-label">{slot.label}</div>
            <div className="meal-slot-empty-icon">
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
          </div>
          {isSlotOver && slotDelta && (
            <div className="meal-slot-delta">
              <DeltaChip label=" cal" value={slotDelta.cal} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Compute slot totals (used by both the slot bars and ingredient bars) ──
  let slotCal = 0, slotProtein = 0, slotCarbs = 0, slotFat = 0;
  for (const item of slot.items) {
    const food = knownFoods.find((f) => f.id === item.foodId);
    if (!food) continue;
    const m = computeMacros(food, item.grams);
    slotCal += m.cal; slotProtein += m.protein; slotCarbs += m.carbs; slotFat += m.fat;
  }
  const slotTotals: Macros = { cal: slotCal, protein: slotProtein, carbs: slotCarbs, fat: slotFat };

  // ── Filled view ───────────────────────────────
  const cells = Array.from({ length: 9 }, (_, i) => slot.items[i] ?? null);

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div
        ref={setSlotRef}
        className={`meal-slot meal-slot-collapsed${isSlotOver ? ' meal-slot--drag-over' : ''}`}
        onClick={onToggle}
        style={{ cursor: 'pointer' }}
      >
        <EdgeBars macros={slotTotals} totals={dayTotals} />
        <SlotGlyphGrid items={slot.items} knownFoods={knownFoods} />
        <button
          className="meal-slot-clear"
          onClick={(e) => { e.stopPropagation(); onClear(); }}
          aria-label={`Clear ${slot.label}`}
        >
          <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {isSlotOver && slotDelta && (
          <div className="meal-slot-delta">
            <DeltaChip label=" cal" value={slotDelta.cal} />
            <div style={{ display: 'flex', gap: 5 }}>
              <DeltaChip label="P" value={slotDelta.protein} />
              <DeltaChip label="C" value={slotDelta.carbs} />
              <DeltaChip label="F" value={slotDelta.fat} />
            </div>
          </div>
        )}
      </div>

      {expanded && (
        <div className="ingredient-popup">
          {cells.map((item, i) => {
            if (!item) {
              return <div key={i} className="ingredient-cell ingredient-cell--empty" />;
            }
            const food = knownFoods.find((f) => f.id === item.foodId);
            if (!food) {
              return <div key={item.id} className="ingredient-cell ingredient-cell--empty" />;
            }
            return (
              <IngredientCell
                key={item.id}
                item={item}
                food={food}
                slotId={slot.id}
                slotTotals={slotTotals}
                onRemove={onRemove}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
