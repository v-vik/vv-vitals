export interface Food {
  id: number;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  created_at: string;
}

export interface CreateFood {
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
}

export interface DiaryEntry {
  id: number;
  date: string;
  notes?: string;
  created_at: string;
}

export interface CreateDiaryEntry {
  date: string;
  notes?: string;
}

export interface DiaryMeal {
  id: number;
  diary_entry_id: number;
  meal_name: string;
  created_at: string;
}

export interface CreateDiaryMeal {
  diary_entry_id: number;
  meal_name: string;
}

export interface DiaryMealFood {
  id: number;
  diary_meal_id: number;
  food_id: number;
  quantity_grams: number;
  created_at: string;
}

export interface CreateDiaryMealFood {
  diary_meal_id: number;
  food_id: number;
  quantity_grams: number;
}
