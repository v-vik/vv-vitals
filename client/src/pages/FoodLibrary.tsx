import { useState } from 'react';
import { useFoods, useCreateFood, useDeleteFood } from '../hooks/useFoods';
import { CreateFood } from '../lib/api';

const emptyForm: CreateFood = {
  name: '',
  calories_per_100g: 0,
  protein_per_100g: 0,
  carbs_per_100g: 0,
  fat_per_100g: 0,
};

function FoodLibrary() {
  const [form, setForm] = useState<CreateFood>(emptyForm);
  const { data, isLoading, isError } = useFoods();
  const createMutation = useCreateFood();
  const deleteMutation = useDeleteFood();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    createMutation.mutate(form, {
      onSuccess: () => setForm(emptyForm),
    });
  };

  const setField = (field: keyof CreateFood, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

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
            <p className="mt-4 text-sm text-slate-500">Loading foods…</p>
          ) : isError ? (
            <p className="mt-4 text-sm text-red-600">Failed to load foods.</p>
          ) : data?.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No foods yet. Add one using the form.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {data?.map((food) => (
                <div key={food.id} className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-medium text-slate-900">{food.name}</h4>
                      <div className="mt-1 flex gap-3 text-xs text-slate-500">
                        <span>{food.calories_per_100g} kcal</span>
                        <span>P: {food.protein_per_100g}g</span>
                        <span>C: {food.carbs_per_100g}g</span>
                        <span>F: {food.fat_per_100g}g</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(food.id)}
                      className="shrink-0 rounded-full px-3 py-1 text-xs text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Add Food</h3>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            {[
              { label: 'Name', field: 'name' as const, type: 'text' },
              { label: 'Calories / 100g', field: 'calories_per_100g' as const, type: 'number' },
              { label: 'Protein / 100g', field: 'protein_per_100g' as const, type: 'number' },
              { label: 'Carbs / 100g', field: 'carbs_per_100g' as const, type: 'number' },
              { label: 'Fat / 100g', field: 'fat_per_100g' as const, type: 'number' },
            ].map(({ label, field, type }) => (
              <label key={field} className="block space-y-1.5 text-sm text-slate-700">
                <span>{label}</span>
                <input
                  type={type}
                  value={form[field]}
                  onChange={(e) =>
                    setField(field, type === 'number' ? Number(e.target.value) : e.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-slate-400 focus:outline-none"
                />
              </label>
            ))}
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Saving…' : 'Add Food'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default FoodLibrary;
