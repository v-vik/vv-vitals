import { useReducer, useMemo } from 'react';
import type { Food, MealSlot, MealSlotId, MacroDelta, DragTarget } from '../types';
import { computeMacros } from '../data/foods';

// ── Actions ───────────────────────────────────────────────

type Action =
  | { type: 'ADD_TO_SLOT'; slotId: MealSlotId; food: Food; grams: number }
  | { type: 'SWAP_INGREDIENT'; slotId: MealSlotId; itemId: string; food: Food }
  | { type: 'REMOVE_FROM_SLOT'; slotId: MealSlotId; itemId: string }
  | { type: 'CLEAR_SLOT'; slotId: MealSlotId }
  | { type: 'UPDATE_GRAMS'; slotId: MealSlotId; itemId: string; grams: number }
  | { type: 'EXPAND_SLOT'; slotId: MealSlotId }
  | { type: 'COLLAPSE_SLOT'; slotId: MealSlotId }
  | { type: 'RESET' };

// ── Initial state — 6 numbered slots, visibility derived ──

const MAX_SLOTS = 6;

const INITIAL_SLOTS: MealSlot[] = Array.from({ length: MAX_SLOTS }, (_, i) => ({
  id: `meal-${i + 1}` as MealSlotId,
  label: `Meal ${i + 1}`,
  items: [],
  expanded: false,
}));

// ── Reducer ───────────────────────────────────────────────

function reducer(slots: MealSlot[], action: Action): MealSlot[] {
  switch (action.type) {
    case 'ADD_TO_SLOT':
      return slots.map((s) =>
        s.id !== action.slotId
          ? s
          : {
              ...s,
              items: [
                ...s.items,
                {
                  id: `i-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  foodId: action.food.id,
                  grams: action.grams,
                },
              ],
            }
      );

    case 'SWAP_INGREDIENT':
      return slots.map((s) =>
        s.id !== action.slotId
          ? s
          : {
              ...s,
              items: s.items.map((item) =>
                item.id !== action.itemId ? item : { ...item, foodId: action.food.id }
              ),
            }
      );

    case 'REMOVE_FROM_SLOT':
      return slots.map((s) =>
        s.id !== action.slotId
          ? s
          : { ...s, items: s.items.filter((item) => item.id !== action.itemId) }
      );

    case 'CLEAR_SLOT':
      return slots.map((s) =>
        s.id !== action.slotId ? s : { ...s, items: [] }
      );

    case 'UPDATE_GRAMS':
      return slots.map((s) =>
        s.id !== action.slotId
          ? s
          : {
              ...s,
              items: s.items.map((item) =>
                item.id !== action.itemId ? item : { ...item, grams: action.grams }
              ),
            }
      );

    case 'EXPAND_SLOT':
      // Only one slot expanded at a time
      return slots.map((s) => ({ ...s, expanded: s.id === action.slotId }));

    case 'COLLAPSE_SLOT':
      return slots.map((s) =>
        s.id !== action.slotId ? s : { ...s, expanded: false }
      );

    case 'RESET':
      return INITIAL_SLOTS;

    default:
      return slots;
  }
}

// ── Delta calculation ─────────────────────────────────────

export function computeDelta(
  food: Food,
  target: DragTarget,
  slots: MealSlot[],
  grams: number,
  knownFoods: Food[]
): MacroDelta {
  const newM = computeMacros(food, grams);

  if (!target) return { cal: 0, protein: 0, carbs: 0, fat: 0 };

  if (target.type === 'slot') {
    return { cal: newM.cal, protein: newM.protein, carbs: newM.carbs, fat: newM.fat };
  }

  // SWAP: net difference = new - old
  const slot = slots.find((s) => s.id === target.slotId);
  const item = slot?.items.find((i) => i.id === target.itemId);
  const oldFood = item ? knownFoods.find((f) => f.id === item.foodId) : null;
  const oldM = oldFood
    ? computeMacros(oldFood, item!.grams)
    : { cal: 0, protein: 0, carbs: 0, fat: 0 };

  return {
    cal: newM.cal - oldM.cal,
    protein: newM.protein - oldM.protein,
    carbs: newM.carbs - oldM.carbs,
    fat: newM.fat - oldM.fat,
  };
}

// ── Hook ──────────────────────────────────────────────────

export function useDayPlan(knownFoods: Food[]) {
  const [slots, dispatch] = useReducer(reducer, INITIAL_SLOTS);

  const dayTotals = useMemo(() => {
    let cal = 0, protein = 0, carbs = 0, fat = 0;
    for (const slot of slots) {
      for (const item of slot.items) {
        const food = knownFoods.find((f) => f.id === item.foodId);
        if (!food) continue;
        const m = computeMacros(food, item.grams);
        cal += m.cal;
        protein += m.protein;
        carbs += m.carbs;
        fat += m.fat;
      }
    }
    return {
      cal: Math.round(cal),
      protein: +protein.toFixed(1),
      carbs: +carbs.toFixed(1),
      fat: +fat.toFixed(1),
    };
  }, [slots, knownFoods]);

  const slotTotals = useMemo(() => {
    const result = new Map<MealSlotId, { cal: number; protein: number; carbs: number; fat: number; items: number }>();
    for (const slot of slots) {
      let cal = 0, protein = 0, carbs = 0, fat = 0;
      for (const item of slot.items) {
        const food = knownFoods.find((f) => f.id === item.foodId);
        if (!food) continue;
        const m = computeMacros(food, item.grams);
        cal += m.cal;
        protein += m.protein;
        carbs += m.carbs;
        fat += m.fat;
      }
      result.set(slot.id, {
        cal: Math.round(cal),
        protein: +protein.toFixed(1),
        carbs: +carbs.toFixed(1),
        fat: +fat.toFixed(1),
        items: slot.items.length,
      });
    }
    return result;
  }, [slots, knownFoods]);

  // Progressive reveal: filled slots + one trailing empty slot for dropping into.
  // Cleared slots are excluded so they don't leave empty holes in the row.
  const visibleSlots = useMemo(() => {
    const filled = slots.filter(s => s.items.length > 0);
    if (filled.length === 0) return [slots[0]];
    let lastFilledIdx = -1;
    slots.forEach((s, i) => { if (s.items.length > 0) lastFilledIdx = i; });
    const nextEmpty = slots.slice(lastFilledIdx + 1).find(s => s.items.length === 0);
    return nextEmpty ? [...filled, nextEmpty] : filled;
  }, [slots]);

  return { slots, visibleSlots, dispatch, dayTotals, slotTotals };
}
