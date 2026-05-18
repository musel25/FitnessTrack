// As "singletons": linha única em `daily_targets` e `app_settings`.

import { getDB } from "@/src/db/client";
import type { DailyTargets, AppSettings } from "@/src/db/types";

export async function getTargets(): Promise<DailyTargets> {
  const db = await getDB();
  // Sempre existe (seed). Não-null assertion é seguro aqui.
  const row = await db.getFirstAsync<DailyTargets>(
    "SELECT * FROM daily_targets WHERE id = 1"
  );
  return row!;
}

export async function setTargets(
  targets: Omit<DailyTargets, "id">
): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `UPDATE daily_targets
     SET kcal=?, protein_g=?, carbs_g=?, fat_g=? WHERE id = 1`,
    [
      targets.kcal,
      targets.protein_g,
      targets.carbs_g,
      targets.fat_g,
    ]
  );
}

export async function getAppSettings(): Promise<AppSettings> {
  const db = await getDB();
  const row = await db.getFirstAsync<AppSettings>(
    "SELECT * FROM app_settings WHERE id = 1"
  );
  return row!;
}

export async function setProgressionIncrement(kg: number): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `UPDATE app_settings SET progression_increment_kg = ? WHERE id = 1`,
    [kg]
  );
}
