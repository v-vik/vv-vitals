export interface FoodIngredient {
  name: string;
  grams: number;
  category?: string;
  per100g: { calories: number; protein: number; carbs: number; fat: number };
}

export interface Food {
  id: string;
  name: string;
  source: string;
  category: string;
  cal: number;
  protein: number;
  carbs: number;
  fat: number;
  caffeine?: number;
  defaultServing: number;
  estimated?: boolean;
  imageUrl?: string;
  ingredients?: FoodIngredient[];
}

export interface PlanItem {
  id: string;
  foodId: string;
  grams: number;
}

// ── Destiny UI data model ─────────────────────────────────

export type MealSlotId = `meal-${number}`;

export interface MealSlot {
  id: MealSlotId;
  label: string;
  items: PlanItem[];
  expanded: boolean;
}

export interface DayPlan {
  slots: MealSlot[];
}

// Lifted drag state — read by slots AND the day bar simultaneously
export interface DragState {
  food: Food | null;
  overTarget: DragTarget;
  grams: number;
}

// Discriminated union — type system enforces all drop cases are handled
export type DragTarget =
  | { type: 'slot'; slotId: MealSlotId }
  | { type: 'ingredient'; slotId: MealSlotId; itemId: string }
  | null;

// ── Shared macro types ────────────────────────────────────

export interface Macros {
  cal: number;
  protein: number;
  carbs: number;
  fat: number;
  caffeine: number;
}

export interface Totals extends Macros {
  items: number;
}

export interface MacroDelta {
  cal: number;
  protein: number;
  carbs: number;
  fat: number;
}

// ── Legacy types (kept for compatibility) ─────────────────

export interface PlanGroup {
  id: string;
  name: string;
  items: PlanItem[];
  saved?: boolean;
}

export type ViewMode = 'food' | 'drink' | 'favourite';

export type SortKey = 'default' | 'protein' | 'carbs' | 'fat' | 'cal';
