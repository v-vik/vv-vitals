import type { Food } from '../types';

interface OFFNutriments {
  'energy-kcal_100g'?: number;
  'energy_100g'?: number;
  'proteins_100g'?: number;
  'carbohydrates_100g'?: number;
  'fat_100g'?: number;
  'caffeine_100g'?: number;
}

interface OFFProduct {
  _id?: string;
  code?: string;
  product_name?: string;
  brands?: string;
  categories_tags?: string[];
  nutriments?: OFFNutriments;
  serving_quantity?: number;
  image_thumb_url?: string;
  image_front_thumb_url?: string;
}

interface OFFResponse {
  products: OFFProduct[];
}

function inferCategory(tags: string[] = []): string {
  const s = tags.join(' ').toLowerCase();
  if (s.includes('beverage') || s.includes('drink') || s.includes('juice') || s.includes('water') || s.includes('soda') || s.includes('coffee') || s.includes('tea')) return 'Beverage';
  if (s.includes('dairy') || s.includes('milk') || s.includes('yogurt') || s.includes('yoghurt') || s.includes('cheese') || s.includes('cream')) return 'Dairy';
  if (s.includes('meat') || s.includes('chicken') || s.includes('beef') || s.includes('pork') || s.includes('fish') || s.includes('seafood') || s.includes('egg')) return 'Protein';
  if (s.includes('bread') || s.includes('cereal') || s.includes('grain') || s.includes('pasta') || s.includes('rice') || s.includes('oat') || s.includes('flour')) return 'Grain';
  if (s.includes('fruit') || s.includes('berry') || s.includes('apple') || s.includes('banana') || s.includes('orange')) return 'Fruit';
  if (s.includes('vegetable') || s.includes('veggie') || s.includes('salad') || s.includes('spinach') || s.includes('broccoli')) return 'Vegetable';
  if (s.includes('nut') || s.includes('seed') || s.includes('almond') || s.includes('peanut') || s.includes('cashew')) return 'Nut';
  if (s.includes('sauce') || s.includes('condiment') || s.includes('dressing') || s.includes('oil') || s.includes('vinegar')) return 'Condiment';
  if (s.includes('snack') || s.includes('chip') || s.includes('crisp') || s.includes('popcorn')) return 'Snack';
  if (s.includes('sweet') || s.includes('chocolate') || s.includes('candy') || s.includes('biscuit') || s.includes('cookie') || s.includes('cake')) return 'Sweet';
  return 'Food';
}

function mapProduct(p: OFFProduct): Food | null {
  const name = p.product_name?.trim();
  if (!name) return null;

  const n = p.nutriments ?? {};
  const calPer100 = n['energy-kcal_100g'] ?? (n['energy_100g'] != null ? n['energy_100g'] / 4.184 : null);
  if (calPer100 == null || calPer100 < 0) return null;

  const protein = n['proteins_100g'] ?? 0;
  const carbs = n['carbohydrates_100g'] ?? 0;
  const fat = n['fat_100g'] ?? 0;
  const caffeine = n['caffeine_100g'];

  const brand = p.brands ? p.brands.split(',')[0].trim() : null;

  return {
    id: 'off-' + (p._id ?? p.code ?? Math.random().toString(36).slice(2)),
    name: brand ? `${name}, ${brand}` : name,
    source: 'Open Food Facts',
    category: inferCategory(p.categories_tags),
    cal: Math.round(calPer100 * 10) / 10,
    protein: Math.round(protein * 10) / 10,
    carbs: Math.round(carbs * 10) / 10,
    fat: Math.round(fat * 10) / 10,
    ...(caffeine != null ? { caffeine: Math.round(caffeine * 10) / 10 } : {}),
    defaultServing: p.serving_quantity && p.serving_quantity > 0 ? p.serving_quantity : 100,
    ...(p.image_front_thumb_url || p.image_thumb_url
      ? { imageUrl: p.image_front_thumb_url ?? p.image_thumb_url }
      : {}),
  };
}

export async function searchOpenFoodFacts(query: string): Promise<Food[]> {
  const params = new URLSearchParams({
    search_terms: query,
    json: 'true',
    page_size: '20',
    fields: '_id,code,product_name,brands,categories_tags,nutriments,serving_quantity,image_front_thumb_url,image_thumb_url',
  });
  const res = await fetch(`https://au.openfoodfacts.org/cgi/search.pl?${params}`);
  if (!res.ok) throw new Error(`Open Food Facts returned ${res.status}`);

  const data: OFFResponse = await res.json();
  return data.products.map(mapProduct).filter((f): f is Food => f !== null);
}
