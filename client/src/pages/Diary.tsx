import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDiaryEntry, addMealToDate, logFoodInMeal, getFoods } from '../lib/api';

const mealOrder = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const;
type MealName = (typeof mealOrder)[number];

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

function Diary() {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(formatDate(new Date()));
  const [activeMeal, setActiveMeal] = useState<MealName | null>(null);
  const [selectedFoodId, setSelectedFoodId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['diary', date],
    queryFn: () => getDiaryEntry(date),
  });

  const { data: foods = [] } = useQuery({ queryKey: ['foods'], queryFn: getFoods });

  const addMealMutation = useMutation({
    mutationFn: (mealName: string) => addMealToDate(date, mealName),
    onSuccess: (_data, mealName) => {
      queryClient.invalidateQueries({ queryKey: ['diary', date] });
      setActiveMeal(mealName as MealName);
    },
  });

  const logFoodMutation = useMutation({
    mutationFn: ({ mealId, foodId, quantityGrams }: { mealId: number; foodId: number; quantityGrams: number }) =>
      logFoodInMeal(date, mealId, foodId, quantityGrams),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary', date] });
      setSelectedFoodId('');
      setQuantity('');
      setActiveMeal(null);
    },
  });

  const totals = useMemo(() => {
    if (!data?.meals) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    return data.meals.reduce(
      (acc, meal) => {
        meal.foods.forEach((food) => {
          const grams = food.quantity_grams / 100;
          acc.calories += food.calories_per_100g * grams;
          acc.protein += food.protein_per_100g * grams;
          acc.carbs += food.carbs_per_100g * grams;
          acc.fat += food.fat_per_100g * grams;
        });
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [data]);

  const handleDateChange = (direction: 'prev' | 'next') => {
    const current = new Date(date);
    current.setDate(current.getDate() + (direction === 'next' ? 1 : -1));
    setDate(formatDate(current));
    setActiveMeal(null);
  };

  const handleAddFood = (mealName: MealName) => {
    const meal = data?.meals?.find((m) => m.meal_name === mealName);
    if (meal) {
      setActiveMeal(mealName);
    } else {
      addMealMutation.mutate(mealName);
    }
  };

  const handleLogFood = (mealName: MealName) => {
    if (selectedFoodId === '' || !quantity || quantity <= 0) return;
    const meal = data?.meals?.find((m) => m.meal_name === mealName);
    if (!meal) return;
    logFoodMutation.mutate({ mealId: meal.id, foodId: selectedFoodId, quantityGrams: quantity });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Daily Diary</h2>
            <p className="mt-2 text-sm text-slate-600">Log meals and track nutrition for a day.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-2">
            <button
              type="button"
              onClick={() => handleDateChange('prev')}
              className="rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Prev
            </button>
            <span className="min-w-[100px] text-center text-sm font-semibold text-slate-900">{date}</span>
            <button
              type="button"
              onClick={() => handleDateChange('next')}
              className="rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {isLoading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-sm text-slate-500">
              Loading diary…
            </div>
          ) : isError ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-sm text-red-600">
              Could not load diary.
            </div>
          ) : (
            mealOrder.map((mealName) => {
              const meal = data?.meals?.find((m) => m.meal_name === mealName);
              const isAdding = activeMeal === mealName;
              return (
                <div key={mealName} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{mealName}</h3>
                    <button
                      type="button"
                      onClick={() => (isAdding ? setActiveMeal(null) : handleAddFood(mealName))}
                      disabled={addMealMutation.isPending}
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      {isAdding ? 'Cancel' : '+ Add Food'}
                    </button>
                  </div>

                  {meal?.foods.length ? (
                    <div className="mt-4 space-y-2">
                      {meal.foods.map((food) => (
                        <div key={food.id} className="rounded-2xl border border-slate-100 p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="font-medium text-slate-900">{food.name}</p>
                              <p className="text-xs text-slate-500">{food.quantity_grams}g</p>
                            </div>
                            <p className="text-sm text-slate-600">
                              {Math.round((food.calories_per_100g * food.quantity_grams) / 100)} kcal
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-400">No foods logged.</p>
                  )}

                  {isAdding && (
                    <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                      <select
                        value={selectedFoodId}
                        onChange={(e) => setSelectedFoodId(Number(e.target.value))}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
                      >
                        <option value="">Select a food…</option>
                        {foods.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name} ({f.calories_per_100g} kcal/100g)
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Quantity (g)"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        min={1}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleLogFood(mealName)}
                        disabled={logFoodMutation.isPending || selectedFoodId === '' || !quantity}
                        className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
                      >
                        {logFoodMutation.isPending ? 'Logging…' : 'Log Food'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Daily Totals</h3>
          <div className="mt-4 grid gap-3 text-sm text-slate-700">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Calories</span>
              <span className="font-medium">{Math.round(totals.calories)} kcal</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Protein</span>
              <span className="font-medium">{totals.protein.toFixed(1)}g</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Carbs</span>
              <span className="font-medium">{totals.carbs.toFixed(1)}g</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Fat</span>
              <span className="font-medium">{totals.fat.toFixed(1)}g</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Diary;
