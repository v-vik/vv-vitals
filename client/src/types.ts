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
}

export interface PlanItem {
  id: string;
  foodId: string;
  grams: number;
}

export interface PlanGroup {
  id: string;
  name: string;
  items: PlanItem[];
  saved?: boolean;
}

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

export type ViewMode = 'food' | 'drink' | 'favourite';

export type SortKey = 'default' | 'protein' | 'carbs' | 'fat' | 'cal';
