// Tipos das entidades do banco. Espelham as tabelas em schema.ts.
//
// Vindo de Python: pense nisso como dataclasses. A diferença é que TypeScript
// só checa em tempo de compilação (não há validação em runtime aqui).
// Pra validação real, usamos `zod` nos formulários (veja src/lib/validation.ts).

export type ID = number;

export type Exercise = {
  id: ID;
  name: string;
  muscle_group: string | null;
  notes: string | null;
  created_at: number; // unix ms
};

export type WorkoutTemplate = {
  id: ID;
  name: string;
  notes: string | null;
};

export type TemplateExercise = {
  id: ID;
  template_id: ID;
  exercise_id: ID;
  position: number;
  target_sets: number | null;
  target_reps_min: number | null;
  target_reps_max: number | null;
};

// Convenience: o que renderizamos numa tela de template — exercício + dados do join.
export type TemplateExerciseWithDetails = TemplateExercise & {
  exercise_name: string;
  muscle_group: string | null;
};

export type WorkoutSession = {
  id: ID;
  template_id: ID | null;
  started_at: number;
  ended_at: number | null;
  notes: string | null;
};

export type SessionSet = {
  id: ID;
  session_id: ID;
  exercise_id: ID;
  set_number: number;
  weight: number;
  reps: number;
  rpe: number | null;
  is_warmup: 0 | 1;
};

export type Food = {
  id: ID;
  name: string;
  brand: string | null;
  serving_size: number;
  serving_unit: "g" | "ml" | "unit" | string;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number | null;
};

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type Meal = {
  id: ID;
  date: string; // YYYY-MM-DD
  meal_type: MealType;
  notes: string | null;
};

export type MealEntry = {
  id: ID;
  meal_id: ID;
  food_id: ID;
  quantity: number;
};

// "Linha rica" — entry + food joinados, pra renderizar a UI.
export type MealEntryWithFood = MealEntry & {
  food: Food;
};

export type DailyTargets = {
  id: 1;
  kcal: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
};

export type AppSettings = {
  id: 1;
  progression_increment_kg: number;
};

// Macros agregados de uma refeição ou dia.
export type Macros = {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
};
