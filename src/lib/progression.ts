// Lógica de progressão de carga (pure functions, sem I/O).
// Manter "puro" facilita testar e raciocinar.

import type { SessionSet } from "@/src/db/types";

// Fórmula de Epley pra estimar 1RM: peso * (1 + reps/30).
// É uma aproximação grosseira mas universal e suficiente pra trackear progresso.
export function epley1RM(weight: number, reps: number): number {
  if (reps <= 0) return 0;
  return weight * (1 + reps / 30);
}

// Volume de uma série = peso × reps. Volume total = soma de todas (sem warm-ups).
export function totalVolume(sets: SessionSet[]): number {
  return sets
    .filter((s) => !s.is_warmup)
    .reduce((acc, s) => acc + s.weight * s.reps, 0);
}

// "Top set" = a maior carga (working set). Em empate, usa mais reps.
export function topSet(sets: SessionSet[]): SessionSet | null {
  const working = sets.filter((s) => !s.is_warmup);
  if (working.length === 0) return null;
  return working.reduce((best, cur) =>
    cur.weight > best.weight ||
    (cur.weight === best.weight && cur.reps > best.reps)
      ? cur
      : best
  );
}

// Sugestão de progressão pra próxima sessão num exercício.
//
// Heurística simples:
// - Se na última sessão você fez todas as séries no top do range alvo,
//   sugere +increment kg.
// - Senão, repete a mesma carga do top set.
// Se não tiver histórico ou range, retorna null (UI mostra "—").
export function suggestNextWeight(opts: {
  lastSets: SessionSet[];
  targetRepsMax: number | null;
  increment: number;
}): number | null {
  const { lastSets, targetRepsMax, increment } = opts;
  const working = lastSets.filter((s) => !s.is_warmup);
  if (working.length === 0) return null;

  const top = topSet(working);
  if (!top) return null;

  // Sem range alvo? Apenas repete a carga.
  if (!targetRepsMax) return top.weight;

  // Se todas as working sets bateram o reps max → sobe a carga.
  const allHitTarget = working.every((s) => s.reps >= targetRepsMax);
  return allHitTarget ? top.weight + increment : top.weight;
}
