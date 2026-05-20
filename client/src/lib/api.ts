import axios from 'axios';
import { z } from 'zod';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
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

export const getFoods = async () => {
  const response = await api.get('/api/foods');
  return FoodsSchema.parse(response.data);
};
