// Templates de treino + os exercícios atrelados a eles.
//
// Modelagem: um template é uma "receita" (Push Day) com N exercícios na ordem desejada.
// Quando inicia uma sessão, copiamos os exercícios do template; mas a sessão é
// independente — pode adicionar/remover sets sem afetar o template.

import { getDB } from "@/src/db/client";
import type {
  WorkoutTemplate,
  TemplateExercise,
  TemplateExerciseWithDetails,
} from "@/src/db/types";

export async function listTemplates(): Promise<WorkoutTemplate[]> {
  const db = await getDB();
  return db.getAllAsync<WorkoutTemplate>(
    "SELECT * FROM workout_templates ORDER BY name COLLATE NOCASE ASC"
  );
}

export async function getTemplate(
  id: number
): Promise<WorkoutTemplate | null> {
  const db = await getDB();
  const row = await db.getFirstAsync<WorkoutTemplate>(
    "SELECT * FROM workout_templates WHERE id = ?",
    [id]
  );
  return row ?? null;
}

export async function getTemplateExercises(
  templateId: number
): Promise<TemplateExerciseWithDetails[]> {
  const db = await getDB();
  return db.getAllAsync<TemplateExerciseWithDetails>(
    `SELECT te.*, e.name AS exercise_name, e.muscle_group
     FROM template_exercises te
     JOIN exercises e ON e.id = te.exercise_id
     WHERE te.template_id = ?
     ORDER BY te.position ASC`,
    [templateId]
  );
}

export type TemplateInput = {
  name: string;
  notes?: string | null;
};

export async function createTemplate(input: TemplateInput): Promise<number> {
  const db = await getDB();
  const result = await db.runAsync(
    `INSERT INTO workout_templates (name, notes) VALUES (?, ?)`,
    [input.name.trim(), input.notes?.trim() || null]
  );
  return result.lastInsertRowId;
}

export async function updateTemplate(
  id: number,
  input: TemplateInput
): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `UPDATE workout_templates SET name = ?, notes = ? WHERE id = ?`,
    [input.name.trim(), input.notes?.trim() || null, id]
  );
}

export async function deleteTemplate(id: number): Promise<void> {
  const db = await getDB();
  await db.runAsync("DELETE FROM workout_templates WHERE id = ?", [id]);
}

export type TemplateExerciseInput = {
  exercise_id: number;
  target_sets?: number | null;
  target_reps_min?: number | null;
  target_reps_max?: number | null;
};

// Substitui em bloco os exercícios do template — mais simples que diff incremental.
// Usado pela tela de edição: usuário reordena/edita tudo, salvamos atomicamente.
export async function setTemplateExercises(
  templateId: number,
  items: TemplateExerciseInput[]
): Promise<void> {
  const db = await getDB();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      "DELETE FROM template_exercises WHERE template_id = ?",
      [templateId]
    );
    for (let i = 0; i < items.length; i++) {
      const it = items[i]!;
      await db.runAsync(
        `INSERT INTO template_exercises
           (template_id, exercise_id, position, target_sets, target_reps_min, target_reps_max)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          templateId,
          it.exercise_id,
          i,
          it.target_sets ?? null,
          it.target_reps_min ?? null,
          it.target_reps_max ?? null,
        ]
      );
    }
  });
}

export async function addTemplateExercise(
  templateId: number,
  input: TemplateExerciseInput
): Promise<number> {
  const db = await getDB();
  const last = await db.getFirstAsync<{ max_pos: number | null }>(
    `SELECT MAX(position) AS max_pos FROM template_exercises WHERE template_id = ?`,
    [templateId]
  );
  const nextPos = (last?.max_pos ?? -1) + 1;
  const result = await db.runAsync(
    `INSERT INTO template_exercises
       (template_id, exercise_id, position, target_sets, target_reps_min, target_reps_max)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      templateId,
      input.exercise_id,
      nextPos,
      input.target_sets ?? null,
      input.target_reps_min ?? null,
      input.target_reps_max ?? null,
    ]
  );
  return result.lastInsertRowId;
}

export async function removeTemplateExercise(
  templateExerciseId: number
): Promise<void> {
  const db = await getDB();
  await db.runAsync("DELETE FROM template_exercises WHERE id = ?", [
    templateExerciseId,
  ]);
}
