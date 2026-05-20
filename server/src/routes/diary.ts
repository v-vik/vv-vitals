import express from 'express';
import { db } from '../db';

const router = express.Router();

router.get('/', (_req, res) => {
  const entries = db
    .prepare('SELECT id, date, notes, created_at FROM diary_entries ORDER BY date DESC')
    .all();
  res.json(entries);
});

router.get('/:date', (req, res) => {
  const { date } = req.params;
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date)) {
    return res.status(400).json({ error: 'Invalid date format' });
  }

  const entry = db.prepare('SELECT * FROM diary_entries WHERE date = ?').get(date);
  if (!entry) {
    return res.status(404).json({ error: 'Diary entry not found' });
  }

  const meals = db
    .prepare('SELECT * FROM diary_meals WHERE diary_entry_id = ? ORDER BY id')
    .all(entry.id);

  const mealFoods = db
    .prepare(
      `SELECT dmf.*, f.name, f.calories_per_100g, f.protein_per_100g, f.carbs_per_100g, f.fat_per_100g
       FROM diary_meal_foods dmf
       JOIN foods f ON dmf.food_id = f.id
       WHERE dmf.diary_meal_id = ?`
    );

  const mealsWithFoods = meals.map((meal: any) => ({
    ...meal,
    foods: mealFoods.all(meal.id),
  }));

  res.json({ ...entry, meals: mealsWithFoods });
});

router.post('/:date/meals', (req, res) => {
  const { date } = req.params;
  const { meal_name } = req.body;

  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date) || typeof meal_name !== 'string') {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const entry = db.prepare('SELECT * FROM diary_entries WHERE date = ?').get(date);
  if (!entry) {
    const insertEntry = db.prepare('INSERT INTO diary_entries (date) VALUES (?)');
    insertEntry.run(date);
  }

  const entryId = db.prepare('SELECT id FROM diary_entries WHERE date = ?').get(date).id;
  const stmt = db.prepare('INSERT INTO diary_meals (diary_entry_id, meal_name) VALUES (?, ?)');
  const result = stmt.run(entryId, meal_name.trim());
  const meal = db.prepare('SELECT * FROM diary_meals WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(meal);
});

router.post('/:date/meals/:mealId/foods', (req, res) => {
  const { mealId } = req.params;
  const { food_id, quantity_grams } = req.body;
  const mealIdNum = Number(mealId);

  if (
    Number.isNaN(mealIdNum) ||
    typeof food_id !== 'number' ||
    typeof quantity_grams !== 'number'
  ) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const meal = db.prepare('SELECT * FROM diary_meals WHERE id = ?').get(mealIdNum);
  if (!meal) {
    return res.status(404).json({ error: 'Meal not found' });
  }

  const food = db.prepare('SELECT * FROM foods WHERE id = ?').get(food_id);
  if (!food) {
    return res.status(404).json({ error: 'Food not found' });
  }

  const stmt = db.prepare(
    'INSERT INTO diary_meal_foods (diary_meal_id, food_id, quantity_grams) VALUES (?, ?, ?)'
  );
  const result = stmt.run(mealIdNum, food_id, quantity_grams);
  const loggedFood = db
    .prepare('SELECT * FROM diary_meal_foods WHERE id = ?')
    .get(result.lastInsertRowid);

  res.status(201).json(loggedFood);
});

router.delete('/meals/:mealId', (req, res) => {
  const mealId = Number(req.params.mealId);
  if (Number.isNaN(mealId)) {
    return res.status(400).json({ error: 'Invalid meal ID' });
  }

  const result = db.prepare('DELETE FROM diary_meals WHERE id = ?').run(mealId);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Meal not found' });
  }

  res.status(204).send();
});

router.delete('/meal-foods/:id', (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid entry ID' });
  }

  const result = db.prepare('DELETE FROM diary_meal_foods WHERE id = ?').run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Meal food not found' });
  }

  res.status(204).send();
});

export default router;
