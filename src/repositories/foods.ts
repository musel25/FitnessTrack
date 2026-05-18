import { getDB } from "@/src/db/client";
import type { Food } from "@/src/db/types";

export async function listFoods(query?: string): Promise<Food[]> {
  const db = await getDB();
  if (query && query.trim().length > 0) {
    const like = `%${query.trim()}%`;
    return db.getAllAsync<Food>(
      `SELECT * FROM foods
       WHERE name LIKE ? COLLATE NOCASE OR brand LIKE ? COLLATE NOCASE
       ORDER BY name COLLATE NOCASE ASC`,
      [like, like]
    );
  }
  return db.getAllAsync<Food>(
    "SELECT * FROM foods ORDER BY name COLLATE NOCASE ASC"
  );
}

export async function getFood(id: number): Promise<Food | null> {
  const db = await getDB();
  const row = await db.getFirstAsync<Food>(
    "SELECT * FROM foods WHERE id = ?",
    [id]
  );
  return row ?? null;
}

export type FoodInput = {
  name: string;
  brand?: string | null;
  serving_size: number;
  serving_unit: string;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number | null;
};

export async function createFood(input: FoodInput): Promise<number> {
  const db = await getDB();
  const result = await db.runAsync(
    `INSERT INTO foods
       (name, brand, serving_size, serving_unit, kcal, protein_g, carbs_g, fat_g, fiber_g)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.name.trim(),
      input.brand?.trim() || null,
      input.serving_size,
      input.serving_unit,
      input.kcal,
      input.protein_g,
      input.carbs_g,
      input.fat_g,
      input.fiber_g ?? null,
    ]
  );
  return result.lastInsertRowId;
}

export async function updateFood(id: number, input: FoodInput): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `UPDATE foods SET name=?, brand=?, serving_size=?, serving_unit=?,
                       kcal=?, protein_g=?, carbs_g=?, fat_g=?, fiber_g=?
     WHERE id = ?`,
    [
      input.name.trim(),
      input.brand?.trim() || null,
      input.serving_size,
      input.serving_unit,
      input.kcal,
      input.protein_g,
      input.carbs_g,
      input.fat_g,
      input.fiber_g ?? null,
      id,
    ]
  );
}

export async function deleteFood(id: number): Promise<void> {
  const db = await getDB();
  await db.runAsync("DELETE FROM foods WHERE id = ?", [id]);
}
