// Formatação de números, datas, duração, etc. Mantemos centralizado.

import { format, formatDistanceToNow } from "date-fns";

export function fmtKg(n: number): string {
  // Sem casas se inteiro, 1 casa se fracionário.
  return Number.isInteger(n) ? `${n} kg` : `${n.toFixed(1)} kg`;
}

export function fmtNum(n: number, digits = 0): string {
  return n.toFixed(digits);
}

export function fmtDateShort(ms: number): string {
  return format(new Date(ms), "dd/MM/yyyy");
}

export function fmtDateDay(date: Date | number | string): string {
  if (typeof date === "string") return date.slice(0, 10);
  return format(new Date(date), "yyyy-MM-dd");
}

export function fmtRelative(ms: number): string {
  return formatDistanceToNow(new Date(ms), { addSuffix: true });
}

export function fmtDuration(startMs: number, endMs: number | null): string {
  const end = endMs ?? Date.now();
  const minutes = Math.floor((end - startMs) / 60000);
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h${m.toString().padStart(2, "0")}`;
}

export function mealTypeLabel(t: string): string {
  const map: Record<string, string> = {
    breakfast: "Café da manhã",
    lunch: "Almoço",
    dinner: "Jantar",
    snack: "Lanche",
  };
  return map[t] ?? t;
}
