import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, Food, FoodsSchema } from '../lib/api';
import { z } from 'zod';

const submitSchema = z.object({
  name: z.string().min(1),
  calories_per_100g: z.number().min(0),
  protein_per_100g: z.number().min(0),
  carbs_per_100g: z.number().min(0),
  fat_per_100g: z.number().min(0),
});

type FoodForm = z.infer<typeof submitSchema>;

const fetchFoods = async () => {
  const response = await api.get('/api/foods');
  return FoodsSchema.parse(response.data);
};

const createFood = async (payload: FoodForm) => {
  const response = await api.post('/api/foods', payload);
  return Food.parse(response.data);
};

function FoodLibrary() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FoodForm>({
    name: '',
    calories_per_100g: 0,
    protein_per_100g: 0,
    carbs_per_100g: 0,
    fat_per_100g: 0,
  });

  const { data, isLoading, isError } = useQuery({ queryKey: ['foods'], queryFn: fetchFoods });
  const mutation = useMutation({
    mutationFn: createFood,
    onSuccess: () => {
      queryClient.invalidateQueries(['foods']);
      setForm({ name: '', calories_per_100g: 0, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 0 });
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = submitSchema.safeParse(form);
    if (!parsed.success) {
      return;
    }

    mutation.mutate(parsed.data);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Food Library</h2>
        <p className="mt-2 text-sm text-slate-600">Add foods once and reuse them in your diary.</p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Foods</h3>
          {isLoading ? (
            <p className="mt-4 text-slate-600">Loading foods…</p>
          ) : isError ? (
            <p className="mt-4 text-red-600">Failed to load foods.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {data?.map((food) => (
                <div key={food.id} className="rounded-3xl border border-slate-200 p-4">
                  <h4 className="text-base font-semibold">{food.name}</h4>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-slate-600 sm:grid-cols-4">
                    <div>Calories: {food.calories_per_100g}</div>
                    <div>Protein: {food.protein_per_100g}</div>
                    <div>Carbs: {food.carbs_per_100g}</div>
                    <div>Fat: {food.fat_per_100g}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Add Food</h3>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2 text-sm text-slate-700">
              <span>Name</span>
              <input
                type="text"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-slate-400 focus:outline-none"
              />
            </label>
            <label className="block space-y-2 text-sm text-slate-700">
              <span>Calories / 100g</span>
              <input
                type="number"
                value={form.calories_per_100g}
                onChange={(event) => setForm((prev) => ({ ...prev, calories_per_100g: Number(event.target.value) }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-slate-400 focus:outline-none"
              />
            </label>
            <label className="block space-y-2 text-sm text-slate-700">
              <span>Protein / 100g</span>
              <input
                type="number"
                value={form.protein_per_100g}
                onChange={(event) => setForm((prev) => ({ ...prev, protein_per_100g: Number(event.target.value) }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-slate-400 focus:outline-none"
              />
            </label>
            <label className="block space-y-2 text-sm text-slate-700">
              <span>Carbs / 100g</span>
              <input
                type="number"
                value={form.carbs_per_100g}
                onChange={(event) => setForm((prev) => ({ ...prev, carbs_per_100g: Number(event.target.value) }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-slate-400 focus:outline-none"
              />
            </label>
            <label className="block space-y-2 text-sm text-slate-700">
              <span>Fat / 100g</span>
              <input
                type="number"
                value={form.fat_per_100g}
                onChange={(event) => setForm((prev) => ({ ...prev, fat_per_100g: Number(event.target.value) }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-slate-400 focus:outline-none"
              />
            </label>
            <button
              type="submit"
              disabled={mutation.isLoading}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
            >
              {mutation.isLoading ? 'Saving...' : 'Add Food'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default FoodLibrary;
