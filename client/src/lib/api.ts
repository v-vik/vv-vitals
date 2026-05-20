import axios from 'axios';
import { z } from 'zod';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

export const FoodSchema = z.object({
  id: z.number(),
  name: z.string(),
  calories_per_100g: z.number(),
  protein_per_100g: z.number(),
  carbs_per_100g: z.number(),
  fat_per_100g: z.number(),
  created_at: z.string(),
});

export const FoodsSchema = z.array(FoodSchema);

export type Food = z.infer<typeof FoodSchema>;
export type CreateFood = Omit<Food, 'id' | 'created_at'>;

export interface DiaryMealFood {
  id: number;
  diary_meal_id: number;
  food_id: number;
  quantity_grams: number;
  created_at: string;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
}

export interface DiaryMeal {
  id: number;
  diary_entry_id: number;
  meal_name: string;
  created_at: string;
  foods: DiaryMealFood[];
}

export interface DiaryEntry {
  id: number;
  date: string;
  notes: string | null;
  created_at: string;
  meals: DiaryMeal[];
}

export const getFoods = async (): Promise<Food[]> => {
  const response = await api.get('/api/foods');
  return FoodsSchema.parse(response.data);
};

export const createFood = async (payload: CreateFood): Promise<Food> => {
  const response = await api.post('/api/foods', payload);
  return FoodSchema.parse(response.data);
};

export const deleteFood = async (id: number): Promise<void> => {
  await api.delete(`/api/foods/${id}`);
};

export const getDiaryEntry = async (date: string): Promise<DiaryEntry | null> => {
  try {
    const response = await api.get(`/api/diary/${date}`);
    return response.data as DiaryEntry;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null;
    throw err;
  }
};

export const addMealToDate = async (date: string, mealName: string): Promise<DiaryMeal> => {
  const response = await api.post(`/api/diary/${date}/meals`, { meal_name: mealName });
  return response.data as DiaryMeal;
};

export const logFoodInMeal = async (
  date: string,
  mealId: number,
  foodId: number,
  quantityGrams: number
): Promise<DiaryMealFood> => {
  const response = await api.post(`/api/diary/${date}/meals/${mealId}/foods`, {
    food_id: foodId,
    quantity_grams: quantityGrams,
  });
  return response.data as DiaryMealFood;
};
