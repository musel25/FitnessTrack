// Toda query SQL relacionada a `exercises` mora aqui.
// Componentes UI chamam `listExercises()`, nunca tocam em SQL direto.
// Isso isola a camada de dados — se trocarmos por outra DB amanhã, só esse diretório muda.

import { getDB } from "@/src/db/client";
import type { Exercise } from "@/src/db/types";

export async function listExercises(): Promise<Exercise[]> {
  const db = await getDB();
  return db.getAllAsync<Exercise>(
    "SELECT * FROM exercises ORDER BY name COLLATE NOCASE ASC"
  );
}

export async function getExercise(id: number): Promise<Exercise | null> {
  const db = await getDB();
  const row = await db.getFirstAsync<Exercise>(
    "SELECT * FROM exercises WHERE id = ?",
    [id]
  );
  return row ?? null;
}

export type ExerciseInput = {
  name: string;
  muscle_group?: string | null;
  notes?: string | null;
};

export async function createExercise(input: ExerciseInput): Promise<number> {
  const db = await getDB();
  const result = await db.runAsync(
    `INSERT INTO exercises (name, muscle_group, notes, created_at)
     VALUES (?, ?, ?, ?)`,
    [
      input.name.trim(),
      input.muscle_group?.trim() || null,
      input.notes?.trim() || null,
      Date.now(),
    ]
  );
  return result.lastInsertRowId;
}

export async function updateExercise(
  id: number,
  input: ExerciseInput
): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `UPDATE exercises SET name = ?, muscle_group = ?, notes = ? WHERE id = ?`,
    [
      input.name.trim(),
      input.muscle_group?.trim() || null,
      input.notes?.trim() || null,
      id,
    ]
  );
}

export async function deleteExercise(id: number): Promise<void> {
  const db = await getDB();
  // ON DELETE CASCADE no schema cuida das tabelas filhas.
  await db.runAsync("DELETE FROM exercises WHERE id = ?", [id]);
}
