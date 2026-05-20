import { z } from 'zod';

export const FoodFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  calories_per_100g: z.number().nonnegative(),
  protein_per_100g: z.number().nonnegative(),
  carbs_per_100g: z.number().nonnegative(),
  fat_per_100g: z.number().nonnegative(),
});

export type FoodFormValues = z.infer<typeof FoodFormSchema>;

export const DiaryDateSchema = z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/);
