import type { Food, FoodIngredient, PlanGroup, Macros, Totals } from '../types';

export function ingredientToFood(ing: FoodIngredient, parentId: string): Food {
  return {
    id: `${parentId}--${ing.name.toLowerCase().replace(/\W+/g, '-')}`,
    name: ing.name,
    source: 'AI estimate',
    category: ing.category ?? 'Ingredient',
    cal: ing.per100g.calories,
    protein: ing.per100g.protein,
    carbs: ing.per100g.carbs,
    fat: ing.per100g.fat,
    defaultServing: ing.grams,
    estimated: true,
  };
}

export const FOOD_DB: Food[] = [
  {
    id: 'chobani-greek',
    name: 'Chobani Greek Yoghurt, Plain',
    source: 'Open Food Facts',
    category: 'Dairy',
    cal: 59, protein: 9.5, carbs: 3.8, fat: 0.4,
    defaultServing: 170,
  },
  {
    id: 'rokeby-strawberry',
    name: 'Rokeby Farms Strawberry Smoothie',
    source: 'Open Food Facts',
    category: 'Beverage',
    cal: 68, protein: 6, carbs: 8, fat: 1.5,
    defaultServing: 250,
  },
  {
    id: 'mixed-berries',
    name: 'Mixed Frozen Berries',
    source: 'USDA',
    category: 'Fruit',
    cal: 57, protein: 0.7, carbs: 14, fat: 0.3,
    defaultServing: 100,
  },
  {
    id: 'chicken-breast',
    name: 'Chicken Breast, Grilled',
    source: 'USDA',
    category: 'Protein',
    cal: 165, protein: 31, carbs: 0, fat: 3.6,
    defaultServing: 180,
  },
  {
    id: 'brown-rice',
    name: 'Brown Rice, Cooked',
    source: 'USDA',
    category: 'Grain',
    cal: 110, protein: 2.6, carbs: 23, fat: 0.9,
    defaultServing: 150,
  },
  {
    id: 'rolled-oats',
    name: 'Rolled Oats, Dry',
    source: 'Open Food Facts',
    category: 'Grain',
    cal: 379, protein: 13, carbs: 67, fat: 6.5,
    defaultServing: 50,
  },
  {
    id: 'almond-butter',
    name: 'Almond Butter',
    source: 'Open Food Facts',
    category: 'Spread',
    cal: 614, protein: 21, carbs: 19, fat: 56,
    defaultServing: 32,
  },
  {
    id: 'banana',
    name: 'Banana, Cavendish',
    source: 'USDA',
    category: 'Fruit',
    cal: 89, protein: 1.1, carbs: 23, fat: 0.3,
    defaultServing: 120,
  },
  {
    id: 'big-mac',
    name: 'Big Mac with Diet Coke (large meal)',
    source: 'AI estimate',
    category: 'Fast Food',
    cal: 1080, protein: 27, carbs: 130, fat: 51,
    defaultServing: 100,
    estimated: true,
    ingredients: [
      { name: 'Beef Patties', grams: 100, category: 'Protein',    per100g: { calories: 250, protein: 20, carbs: 2,  fat: 19 } },
      { name: 'Sesame Bun',   grams: 90,  category: 'Grain',      per100g: { calories: 265, protein: 9,  carbs: 51, fat: 3  } },
      { name: 'Special Sauce',grams: 30,  category: 'Condiment',  per100g: { calories: 350, protein: 1,  carbs: 20, fat: 30 } },
      { name: 'Lettuce & Pickles', grams: 20, category: 'Vegetable', per100g: { calories: 15, protein: 1, carbs: 3, fat: 0 } },
      { name: 'Large Fries',  grams: 154, category: 'Fast Food',  per100g: { calories: 320, protein: 4,  carbs: 42, fat: 15 } },
    ],
  },
  {
    id: 'salmon',
    name: 'Atlantic Salmon, Pan-seared',
    source: 'USDA',
    category: 'Protein',
    cal: 208, protein: 20, carbs: 0, fat: 13,
    defaultServing: 140,
  },
  {
    id: 'avocado',
    name: 'Avocado, Hass',
    source: 'USDA',
    category: 'Fruit',
    cal: 160, protein: 2, carbs: 9, fat: 15,
    defaultServing: 100,
  },
  {
    id: 'sourdough',
    name: 'Sourdough Bread',
    source: 'Open Food Facts',
    category: 'Grain',
    cal: 289, protein: 12, carbs: 56, fat: 1.4,
    defaultServing: 60,
  },
  {
    id: 'espresso',
    name: 'Espresso, Single Shot',
    source: 'USDA',
    category: 'Beverage',
    cal: 9, protein: 0.1, carbs: 1.5, fat: 0.2, caffeine: 212,
    defaultServing: 30,
  },
  {
    id: 'olive-oil',
    name: 'Extra Virgin Olive Oil',
    source: 'USDA',
    category: 'Fat',
    cal: 884, protein: 0, carbs: 0, fat: 100,
    defaultServing: 14,
  },
  {
    id: 'spinach',
    name: 'Baby Spinach, Raw',
    source: 'USDA',
    category: 'Vegetable',
    cal: 23, protein: 2.9, carbs: 3.6, fat: 0.4,
    defaultServing: 80,
  },
  {
    id: 'eggs',
    name: 'Whole Eggs',
    source: 'USDA',
    category: 'Protein',
    cal: 155, protein: 13, carbs: 1.1, fat: 11,
    defaultServing: 100,
  },
  {
    id: 'honey',
    name: 'Raw Honey',
    source: 'Open Food Facts',
    category: 'Sweetener',
    cal: 304, protein: 0.3, carbs: 82, fat: 0,
    defaultServing: 21,
  },
];

export const INITIAL_PLAN: PlanGroup[] = [
  {
    id: 'g1',
    name: 'Yoghurt bowl',
    saved: true,
    items: [
      { id: 'i1', foodId: 'chobani-greek', grams: 250 },
      { id: 'i2', foodId: 'mixed-berries', grams: 100 },
      { id: 'i3', foodId: 'honey', grams: 15 },
    ],
  },
  {
    id: 'g2',
    name: 'Lunch',
    saved: true,
    items: [
      { id: 'i4', foodId: 'chicken-breast', grams: 180 },
      { id: 'i5', foodId: 'brown-rice', grams: 150 },
      { id: 'i6', foodId: 'spinach', grams: 80 },
    ],
  },
];

export const INITIAL_FAVOURITES: string[] = ['chobani-greek', 'almond-butter', 'salmon'];

export const DAILY_CAL_GOAL = 2200;

export const fmt = {
  cal: (n: number): string => Math.round(n).toLocaleString(),
  g: (n: number): string => (n < 10 ? n.toFixed(1) : Math.round(n).toString()),
};

export function computeMacros(food: Food, grams: number): Macros {
  const r = grams / 100;
  return {
    cal: food.cal * r,
    protein: food.protein * r,
    carbs: food.carbs * r,
    fat: food.fat * r,
    caffeine: (food.caffeine ?? 0) * r,
  };
}

export function planTotals(plan: PlanGroup[], db: Food[]): Totals {
  const totals: Totals = { cal: 0, protein: 0, carbs: 0, fat: 0, caffeine: 0, items: 0 };
  for (const group of plan) {
    for (const item of group.items) {
      const food = db.find((f) => f.id === item.foodId);
      if (!food) continue;
      const m = computeMacros(food, item.grams);
      totals.cal += m.cal;
      totals.protein += m.protein;
      totals.carbs += m.carbs;
      totals.fat += m.fat;
      totals.caffeine += m.caffeine;
      totals.items += 1;
    }
  }
  return totals;
}

export function groupCal(group: PlanGroup, db: Food[]): number {
  return group.items.reduce((sum, item) => {
    const food = db.find((f) => f.id === item.foodId);
    return food ? sum + computeMacros(food, item.grams).cal : sum;
  }, 0);
}

export function snapToStep(value: number, step = 25, min = 25, max = 500): number {
  return Math.max(min, Math.min(max, Math.round(value / step) * step));
}
