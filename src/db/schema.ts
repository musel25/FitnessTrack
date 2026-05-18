// SQL pra criar todas as tabelas. Uma única migração inicial (v1).
// Se quisermos evoluir o schema depois (adicionar coluna, etc) criamos uma migração v2.
//
// Por que SQL "puro" ao invés de um ORM (Prisma, Drizzle)?
// Pra ficar simples e enxuto. Esse app é local-first, monousuário, sem features fancy.
// Um ORM aqui seria over-engineering — e Drizzle/Prisma em RN ainda tem fricção.

export const SCHEMA_V1 = `
CREATE TABLE IF NOT EXISTS exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  muscle_group TEXT,
  notes TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS workout_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS template_exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_id INTEGER NOT NULL REFERENCES workout_templates(id) ON DELETE CASCADE,
  exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  target_sets INTEGER,
  target_reps_min INTEGER,
  target_reps_max INTEGER
);

CREATE TABLE IF NOT EXISTS workout_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_id INTEGER REFERENCES workout_templates(id) ON DELETE SET NULL,
  started_at INTEGER NOT NULL,
  ended_at INTEGER,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS session_sets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  weight REAL NOT NULL,
  reps INTEGER NOT NULL,
  rpe REAL,
  is_warmup INTEGER NOT NULL DEFAULT 0
);

-- Índices úteis pra queries de histórico.
CREATE INDEX IF NOT EXISTS idx_sets_exercise ON session_sets(exercise_id);
CREATE INDEX IF NOT EXISTS idx_sets_session ON session_sets(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started ON workout_sessions(started_at);

CREATE TABLE IF NOT EXISTS foods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  brand TEXT,
  serving_size REAL NOT NULL,
  serving_unit TEXT NOT NULL,
  kcal REAL NOT NULL,
  protein_g REAL NOT NULL,
  carbs_g REAL NOT NULL,
  fat_g REAL NOT NULL,
  fiber_g REAL
);

CREATE TABLE IF NOT EXISTS meals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,        -- 'YYYY-MM-DD'
  meal_type TEXT NOT NULL,   -- 'breakfast' | 'lunch' | 'dinner' | 'snack'
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(date);

CREATE TABLE IF NOT EXISTS meal_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  meal_id INTEGER NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  food_id INTEGER NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  quantity REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_targets (
  id INTEGER PRIMARY KEY CHECK (id = 1),  -- linha única
  kcal REAL,
  protein_g REAL,
  carbs_g REAL,
  fat_g REAL
);

CREATE TABLE IF NOT EXISTS app_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  progression_increment_kg REAL NOT NULL DEFAULT 2.5
);
`;

// Inserts iniciais (idempotentes) — garantem que linhas singleton existem.
export const SCHEMA_V1_SEED = `
INSERT OR IGNORE INTO daily_targets (id, kcal, protein_g, carbs_g, fat_g)
  VALUES (1, 2500, 180, 280, 70);
INSERT OR IGNORE INTO app_settings (id, progression_increment_kg)
  VALUES (1, 2.5);
`;
