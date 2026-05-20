import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

const mealOrder = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const;

type MealName = (typeof mealOrder)[number];

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

const fetchDiary = async (date: string) => {
  const response = await api.get(`/api/diary/${date}`);
  return response.data;
};

function Diary() {
  const [date, setDate] = useState(formatDate(new Date()));
  const { data, isLoading, isError } = useQuery({
    queryKey: ['diary', date],
    queryFn: () => fetchDiary(date),
    retry: false,
  });

  const totals = useMemo(() => {
    if (!data?.meals) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    return data.meals.reduce(
      (acc: any, meal: any) => {
        meal.foods.forEach((food: any) => {
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
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Daily Diary</h2>
            <p className="mt-2 text-sm text-slate-600">View meals and nutrition totals for a selected day.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-2">
            <button
              type="button"
              onClick={() => handleDateChange('prev')}
              className="rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Prev
            </button>
            <span className="text-sm font-semibold text-slate-900">{date}</span>
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
        <div className="space-y-6">
          {isLoading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">Loading diary…</div>
          ) : isError ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-red-600 shadow-sm">Could not load diary.</div>
          ) : (
            mealOrder.map((mealName) => {
              const meal = data?.meals?.find((item: any) => item.meal_name === mealName);
              return (
                <div key={mealName} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold">{mealName}</h3>
                  {meal?.foods.length ? (
                    <div className="mt-4 space-y-4">
                      {meal.foods.map((food: any) => (
                        <div key={food.id} className="rounded-3xl border border-slate-100 p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="font-semibold text-slate-900">{food.name}</p>
                              <p className="text-sm text-slate-500">{food.quantity_grams}g</p>
                            </div>
                            <p className="text-sm text-slate-600">
                              {Math.round((food.calories_per_100g * food.quantity_grams) / 100)} kcal
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-slate-600">No foods logged for {mealName}.</p>
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
              <span>{Math.round(totals.calories)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Protein</span>
              <span>{Math.round(totals.protein)}g</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Carbs</span>
              <span>{Math.round(totals.carbs)}g</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Fat</span>
              <span>{Math.round(totals.fat)}g</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Diary;
