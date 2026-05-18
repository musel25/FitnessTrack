// Sessões de treino (uma sessão = um dia de treino realizado) e suas séries.

import { getDB } from "@/src/db/client";
import type {
  WorkoutSession,
  SessionSet,
} from "@/src/db/types";

export async function listSessions(limit = 50): Promise<WorkoutSession[]> {
  const db = await getDB();
  return db.getAllAsync<WorkoutSession>(
    `SELECT * FROM workout_sessions ORDER BY started_at DESC LIMIT ?`,
    [limit]
  );
}

export async function getSession(id: number): Promise<WorkoutSession | null> {
  const db = await getDB();
  const row = await db.getFirstAsync<WorkoutSession>(
    `SELECT * FROM workout_sessions WHERE id = ?`,
    [id]
  );
  return row ?? null;
}

export async function startSession(
  templateId: number | null
): Promise<number> {
  const db = await getDB();
  const result = await db.runAsync(
    `INSERT INTO workout_sessions (template_id, started_at) VALUES (?, ?)`,
    [templateId, Date.now()]
  );
  return result.lastInsertRowId;
}

export async function endSession(
  id: number,
  notes?: string | null
): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `UPDATE workout_sessions SET ended_at = ?, notes = ? WHERE id = ?`,
    [Date.now(), notes ?? null, id]
  );
}

export async function deleteSession(id: number): Promise<void> {
  const db = await getDB();
  await db.runAsync(`DELETE FROM workout_sessions WHERE id = ?`, [id]);
}

// ----- sets -----

export async function getSessionSets(
  sessionId: number
): Promise<SessionSet[]> {
  const db = await getDB();
  return db.getAllAsync<SessionSet>(
    `SELECT * FROM session_sets WHERE session_id = ?
     ORDER BY exercise_id, set_number`,
    [sessionId]
  );
}

export async function getSetsForExerciseInSession(
  sessionId: number,
  exerciseId: number
): Promise<SessionSet[]> {
  const db = await getDB();
  return db.getAllAsync<SessionSet>(
    `SELECT * FROM session_sets
     WHERE session_id = ? AND exercise_id = ?
     ORDER BY set_number ASC`,
    [sessionId, exerciseId]
  );
}

export type SessionSetInput = {
  session_id: number;
  exercise_id: number;
  weight: number;
  reps: number;
  rpe?: number | null;
  is_warmup?: boolean;
};

export async function addSet(input: SessionSetInput): Promise<number> {
  const db = await getDB();
  // set_number = MAX(existente) + 1 nesse exercício/sessão.
  const last = await db.getFirstAsync<{ max_n: number | null }>(
    `SELECT MAX(set_number) AS max_n FROM session_sets
     WHERE session_id = ? AND exercise_id = ?`,
    [input.session_id, input.exercise_id]
  );
  const nextSet = (last?.max_n ?? 0) + 1;
  const result = await db.runAsync(
    `INSERT INTO session_sets
       (session_id, exercise_id, set_number, weight, reps, rpe, is_warmup)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      input.session_id,
      input.exercise_id,
      nextSet,
      input.weight,
      input.reps,
      input.rpe ?? null,
      input.is_warmup ? 1 : 0,
    ]
  );
  return result.lastInsertRowId;
}

export async function deleteSet(id: number): Promise<void> {
  const db = await getDB();
  await db.runAsync(`DELETE FROM session_sets WHERE id = ?`, [id]);
}

// -- histórico --

// "Última sessão" desse exercício, antes (ou diferente) de `excludeSessionId`.
// Usado na tela de sessão ativa: "o que fiz da última vez nesse exercício?"
export async function getLastSetsForExercise(
  exerciseId: number,
  excludeSessionId?: number
): Promise<SessionSet[]> {
  const db = await getDB();
  // Pegamos o ID da sessão mais recente que tem sets desse exercício.
  const lastSession = await db.getFirstAsync<{ session_id: number }>(
    `SELECT s.id AS session_id FROM workout_sessions s
     JOIN session_sets ss ON ss.session_id = s.id
     WHERE ss.exercise_id = ? ${excludeSessionId ? "AND s.id != ?" : ""}
     ORDER BY s.started_at DESC
     LIMIT 1`,
    excludeSessionId ? [exerciseId, excludeSessionId] : [exerciseId]
  );
  if (!lastSession) return [];
  return db.getAllAsync<SessionSet>(
    `SELECT * FROM session_sets
     WHERE session_id = ? AND exercise_id = ?
     ORDER BY set_number ASC`,
    [lastSession.session_id, exerciseId]
  );
}

// Histórico agregado por sessão pra plotar gráfico de progressão.
// Cada ponto = uma sessão. Calculamos top set, volume e e1RM em SQL pra ser rápido.
export type ExerciseHistoryPoint = {
  session_id: number;
  started_at: number;
  top_weight: number;
  top_reps: number;
  total_volume: number;
  est_1rm: number;
};

export async function getExerciseHistory(
  exerciseId: number,
  limit = 20
): Promise<ExerciseHistoryPoint[]> {
  const db = await getDB();
  // Top set = maior peso (ignorando warm-ups). Volume = Σ peso*reps.
  // e1RM por Epley: peso * (1 + reps/30). Pegamos o maior estimado da sessão.
  const rows = await db.getAllAsync<{
    session_id: number;
    started_at: number;
    top_weight: number;
    top_reps: number;
    total_volume: number;
    est_1rm: number;
  }>(
    `SELECT s.id AS session_id,
            s.started_at AS started_at,
            MAX(CASE WHEN ss.is_warmup = 0 THEN ss.weight ELSE 0 END) AS top_weight,
            (SELECT reps FROM session_sets
             WHERE session_id = s.id AND exercise_id = ? AND is_warmup = 0
             ORDER BY weight DESC, reps DESC LIMIT 1) AS top_reps,
            SUM(CASE WHEN ss.is_warmup = 0 THEN ss.weight * ss.reps ELSE 0 END) AS total_volume,
            MAX(CASE WHEN ss.is_warmup = 0
                     THEN ss.weight * (1.0 + ss.reps / 30.0)
                     ELSE 0 END) AS est_1rm
     FROM workout_sessions s
     JOIN session_sets ss ON ss.session_id = s.id
     WHERE ss.exercise_id = ?
     GROUP BY s.id
     ORDER BY s.started_at ASC
     LIMIT ?`,
    [exerciseId, exerciseId, limit]
  );
  return rows;
}
