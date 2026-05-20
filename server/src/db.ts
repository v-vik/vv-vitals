import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dataDir = path.resolve(__dirname, '../data');
const databaseFile = path.join(dataDir, 'tracker.db');

export const initDb = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = new Database(databaseFile);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS foods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      calories_per_100g INTEGER NOT NULL,
      protein_per_100g INTEGER NOT NULL,
      carbs_per_100g INTEGER NOT NULL,
      fat_per_100g INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS diary_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS diary_meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      diary_entry_id INTEGER NOT NULL,
      meal_name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (diary_entry_id) REFERENCES diary_entries(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS diary_meal_foods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      diary_meal_id INTEGER NOT NULL,
      food_id INTEGER NOT NULL,
      quantity_grams INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (diary_meal_id) REFERENCES diary_meals(id) ON DELETE CASCADE,
      FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE RESTRICT
    );
  `);

  return db;
};

export const db = initDb();
