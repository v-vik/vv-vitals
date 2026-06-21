import { useDroppable } from '@dnd-kit/core';
import { FoodGlyph } from './FoodGlyph';
import { computeMacros, fmt } from '../data/foods';
import type { Food, MealSlot, MealSlotId, PlanItem } from '../types';

// ── Ingredient row — droppable swap target ────────────────

function IngredientRow({ item, food, slotId, onRemove }: {
  item: PlanItem;
  food: Food;
  slotId: MealSlotId;
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
      className={`ing-bubble${isOver ? ' ing-bubble--over' : ''}`}
    >
      <button
        className="ing-bubble-remove"
        onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
        aria-label={`Remove ${food.name.split(',')[0]}`}
      >
        <svg width={7} height={7} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
      <FoodGlyph food={food} size={80} />
      <span className="ing-bubble-name">{food.name.split(',')[0]}</span>
      <span className="ing-bubble-grams">{item.grams}g · {fmt.cal(macros.cal)}</span>
    </div>
  );
}

// ── Panel drop zone — add food to this meal ───────────────

function PanelDropZone({ slotId }: { slotId: MealSlotId }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `ingpanel:${slotId}`,
    data: { type: 'slot', slotId },
  });

  return (
    <div
      ref={setNodeRef}
      className={`panel-drop-zone${isOver ? ' panel-drop-zone--over' : ''}`}
    >
      <span>{isOver ? 'Release to add' : '+ drop food here'}</span>
    </div>
  );
}

// ── IngredientPanel ───────────────────────────────────────

interface IngredientPanelProps {
  slot: MealSlot;
  knownFoods: Food[];
  onRemove: (slotId: MealSlotId, itemId: string) => void;
}

export function IngredientPanel({ slot, knownFoods, onRemove }: IngredientPanelProps) {
  return (
    <>
      <div className="ingredient-panel-heading">{slot.label}</div>
      <div className="ingredient-panel-list">
        {slot.items.map((item) => {
          const food = knownFoods.find((f) => f.id === item.foodId);
          if (!food) return null;
          return (
            <IngredientRow
              key={item.id}
              item={item}
              food={food}
              slotId={slot.id}
              onRemove={(itemId) => onRemove(slot.id, itemId)}
            />
          );
        })}
        <PanelDropZone slotId={slot.id} />
      </div>
    </>
  );
}
