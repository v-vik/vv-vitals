import express from 'express';
import { db } from '../db';
import { CreateFood } from '../types';

const router = express.Router();

router.get('/', (_req, res) => {
  const foods = db.prepare('SELECT * FROM foods ORDER BY name').all();
  res.json(foods);
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid food ID' });
  }

  const food = db.prepare('SELECT * FROM foods WHERE id = ?').get(id);
  if (!food) {
    return res.status(404).json({ error: 'Food not found' });
  }

  res.json(food);
});

router.post('/', (req, res) => {
  const body = req.body as CreateFood;
  if (
    !body?.name ||
    typeof body.name !== 'string' ||
    typeof body.calories_per_100g !== 'number' ||
    typeof body.protein_per_100g !== 'number' ||
    typeof body.carbs_per_100g !== 'number' ||
    typeof body.fat_per_100g !== 'number'
  ) {
    return res.status(400).json({ error: 'Invalid food payload' });
  }

  try {
    const stmt = db.prepare(
      'INSERT INTO foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g) VALUES (?, ?, ?, ?, ?)'
    );
    const result = stmt.run(
      body.name.trim(),
      body.calories_per_100g,
      body.protein_per_100g,
      body.carbs_per_100g,
      body.fat_per_100g
    );
    const food = db.prepare('SELECT * FROM foods WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(food);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create food' });
  }
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const body = req.body as CreateFood;
  if (
    Number.isNaN(id) ||
    !body?.name ||
    typeof body.name !== 'string' ||
    typeof body.calories_per_100g !== 'number' ||
    typeof body.protein_per_100g !== 'number' ||
    typeof body.carbs_per_100g !== 'number' ||
    typeof body.fat_per_100g !== 'number'
  ) {
    return res.status(400).json({ error: 'Invalid update payload' });
  }

  const existing = db.prepare('SELECT * FROM foods WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Food not found' });
  }

  try {
    db.prepare(
      'UPDATE foods SET name = ?, calories_per_100g = ?, protein_per_100g = ?, carbs_per_100g = ?, fat_per_100g = ? WHERE id = ?'
    ).run(
      body.name.trim(),
      body.calories_per_100g,
      body.protein_per_100g,
      body.carbs_per_100g,
      body.fat_per_100g,
      id
    );
    const updatedFood = db.prepare('SELECT * FROM foods WHERE id = ?').get(id);
    res.json(updatedFood);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update food' });
  }
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid food ID' });
  }

  const result = db.prepare('DELETE FROM foods WHERE id = ?').run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Food not found' });
  }

  res.status(204).send();
});

export default router;
