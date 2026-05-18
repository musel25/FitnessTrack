// Agregação de macros pra refeições e dia inteiro.

import type { Food, Macros, MealEntryWithFood } from "@/src/db/types";

export const ZERO_MACROS: Macros = {
  kcal: 0,
  protein_g: 0,
  carbs_g: 0,
  fat_g: 0,
  fiber_g: 0,
};

// Macros que uma certa quantidade de um alimento entrega.
// `quantity` é multiplicador da serving_size base.
//   ex: serving_size=100g, kcal=200. quantity=1.5 → kcal=300 (150g).
export function macrosForEntry(food: Food, quantity: number): Macros {
  return {
    kcal: food.kcal * quantity,
    protein_g: food.protein_g * quantity,
    carbs_g: food.carbs_g * quantity,
    fat_g: food.fat_g * quantity,
    fiber_g: (food.fiber_g ?? 0) * quantity,
  };
}

export function sumMacros(entries: MealEntryWithFood[]): Macros {
  return entries.reduce<Macros>((acc, e) => {
    const m = macrosForEntry(e.food, e.quantity);
    return {
      kcal: acc.kcal + m.kcal,
      protein_g: acc.protein_g + m.protein_g,
      carbs_g: acc.carbs_g + m.carbs_g,
      fat_g: acc.fat_g + m.fat_g,
      fiber_g: acc.fiber_g + m.fiber_g,
    };
  }, ZERO_MACROS);
}

export function addMacros(a: Macros, b: Macros): Macros {
  return {
    kcal: a.kcal + b.kcal,
    protein_g: a.protein_g + b.protein_g,
    carbs_g: a.carbs_g + b.carbs_g,
    fat_g: a.fat_g + b.fat_g,
    fiber_g: a.fiber_g + b.fiber_g,
  };
}

// Progresso (0..1+) de um valor atual contra um alvo. Acima de 1.0 = passou do alvo.
export function progress(current: number, target: number | null): number {
  if (!target || target <= 0) return 0;
  return current / target;
}
