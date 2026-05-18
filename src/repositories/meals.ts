import { getDB } from "@/src/db/client";
import type {
  Meal,
  MealEntry,
  MealEntryWithFood,
  MealType,
  Food,
} from "@/src/db/types";

export async function listMealsByDate(date: string): Promise<Meal[]> {
  const db = await getDB();
  return db.getAllAsync<Meal>(
    `SELECT * FROM meals WHERE date = ? ORDER BY id ASC`,
    [date]
  );
}

// Garantia: existe uma única refeição (date, meal_type). Cria sob demanda.
export async function getOrCreateMeal(
  date: string,
  mealType: MealType
): Promise<number> {
  const db = await getDB();
  const existing = await db.getFirstAsync<Meal>(
    `SELECT * FROM meals WHERE date = ? AND meal_type = ? LIMIT 1`,
    [date, mealType]
  );
  if (existing) return existing.id;
  const result = await db.runAsync(
    `INSERT INTO meals (date, meal_type) VALUES (?, ?)`,
    [date, mealType]
  );
  return result.lastInsertRowId;
}

export async function getMealEntries(
  mealId: number
): Promise<MealEntryWithFood[]> {
  const db = await getDB();
  // Junta entry + food em uma só passada. Mapeamos resultado pra MealEntryWithFood.
  const rows = await db.getAllAsync<MealEntry & Food & { food_id_x: number }>(
    `SELECT me.id, me.meal_id, me.food_id AS food_id_x, me.quantity,
            f.id AS food_pk, f.name, f.brand, f.serving_size, f.serving_unit,
            f.kcal, f.protein_g, f.carbs_g, f.fat_g, f.fiber_g
     FROM meal_entries me
     JOIN foods f ON f.id = me.food_id
     WHERE me.meal_id = ?
     ORDER BY me.id ASC`,
    [mealId]
  );

  // Os campos vêm achatados; remontamos em `entry + food`.
  return rows.map((r: any) => ({
    id: r.id,
    meal_id: r.meal_id,
    food_id: r.food_id_x,
    quantity: r.quantity,
    food: {
      id: r.food_pk,
      name: r.name,
      brand: r.brand,
      serving_size: r.serving_size,
      serving_unit: r.serving_unit,
      kcal: r.kcal,
      protein_g: r.protein_g,
      carbs_g: r.carbs_g,
      fat_g: r.fat_g,
      fiber_g: r.fiber_g,
    },
  }));
}

export async function addMealEntry(
  mealId: number,
  foodId: number,
  quantity: number
): Promise<number> {
  const db = await getDB();
  const result = await db.runAsync(
    `INSERT INTO meal_entries (meal_id, food_id, quantity) VALUES (?, ?, ?)`,
    [mealId, foodId, quantity]
  );
  return result.lastInsertRowId;
}

export async function deleteMealEntry(id: number): Promise<void> {
  const db = await getDB();
  await db.runAsync(`DELETE FROM meal_entries WHERE id = ?`, [id]);
}

// Útil pra tela de "Dia atual" — retorna tudo do dia já agrupado.
export type DayBreakdown = {
  meal_type: MealType;
  meal_id: number;
  entries: MealEntryWithFood[];
};

export async function getDayBreakdown(date: string): Promise<DayBreakdown[]> {
  const meals = await listMealsByDate(date);
  const breakdown: DayBreakdown[] = [];
  for (const m of meals) {
    const entries = await getMealEntries(m.id);
    breakdown.push({
      meal_type: m.meal_type,
      meal_id: m.id,
      entries,
    });
  }
  return breakdown;
}
