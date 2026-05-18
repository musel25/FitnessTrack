// Tab Dieta — visão do dia atual.
// Topo: barras de progresso (kcal/protein/carbs/fat) vs targets.
// 4 cards: café, almoço, jantar, lanche — cada um com lista de entries e total.

import { useCallback, useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { Screen } from "@/src/components/Screen";
import { Card } from "@/src/components/Card";
import { Button } from "@/src/components/Button";
import { MacroBar } from "@/src/components/MacroBar";
import { useAsync } from "@/src/hooks/useAsync";
import { getDayBreakdown, deleteMealEntry } from "@/src/repositories/meals";
import { getTargets } from "@/src/repositories/settings";
import { addMacros, sumMacros, ZERO_MACROS } from "@/src/lib/macros";
import { macrosForEntry } from "@/src/lib/macros";
import { fmtDateDay, mealTypeLabel } from "@/src/lib/format";
import type { MealType } from "@/src/db/types";
import { notifyError } from "@/src/lib/toast";

const ALL_MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export default function DietTab() {
  const router = useRouter();
  const today = useMemo(() => fmtDateDay(new Date()), []);
  const breakdown = useAsync(() => getDayBreakdown(today), [today]);
  const targets = useAsync(() => getTargets(), []);

  useFocusEffect(
    useCallback(() => {
      breakdown.reload();
      targets.reload();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  // Total do dia = soma de todas as refeições.
  const dayTotal = useMemo(() => {
    if (!breakdown.data) return ZERO_MACROS;
    return breakdown.data.reduce((acc, b) => addMacros(acc, sumMacros(b.entries)), ZERO_MACROS);
  }, [breakdown.data]);

  async function handleDeleteEntry(id: number) {
    try {
      await deleteMealEntry(id);
      breakdown.reload();
    } catch (e) {
      notifyError(e);
    }
  }

  return (
    <Screen>
      <Text className="mb-1 text-2xl font-bold text-text">Dieta</Text>
      <Text className="mb-4 text-sm text-text-muted">{today}</Text>

      {/* Barras de macros */}
      <Card className="mb-4">
        <MacroBar
          label="Calorias"
          current={dayTotal.kcal}
          target={targets.data?.kcal ?? null}
          unit=" kcal"
          color="bg-amber-500"
        />
        <MacroBar
          label="Proteína"
          current={dayTotal.protein_g}
          target={targets.data?.protein_g ?? null}
          color="bg-emerald-500"
        />
        <MacroBar
          label="Carboidratos"
          current={dayTotal.carbs_g}
          target={targets.data?.carbs_g ?? null}
          color="bg-sky-500"
        />
        <MacroBar
          label="Gordura"
          current={dayTotal.fat_g}
          target={targets.data?.fat_g ?? null}
          color="bg-rose-500"
        />
      </Card>

      {/* Refeições */}
      <View className="gap-3">
        {ALL_MEAL_TYPES.map((mt) => {
          const found = breakdown.data?.find((b) => b.meal_type === mt);
          const entries = found?.entries ?? [];
          const macros = sumMacros(entries);
          return (
            <Card key={mt}>
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-base font-semibold text-text">
                  {mealTypeLabel(mt)}
                </Text>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/meals/add",
                      params: { date: today, meal_type: mt },
                    })
                  }
                >
                  <Text className="text-sm text-brand">+ Adicionar</Text>
                </Pressable>
              </View>

              {entries.length === 0 ? (
                <Text className="text-sm text-text-muted">
                  Nada registrado ainda.
                </Text>
              ) : (
                <View>
                  {entries.map((e) => {
                    const m = macrosForEntry(e.food, e.quantity);
                    return (
                      <View
                        key={e.id}
                        className="mb-1 flex-row items-center justify-between rounded-lg bg-bg-input px-3 py-2"
                      >
                        <View className="flex-1">
                          <Text className="text-text">
                            {e.food.name}
                            {e.food.brand ? (
                              <Text className="text-text-muted">
                                {" "}
                                · {e.food.brand}
                              </Text>
                            ) : null}
                          </Text>
                          <Text className="text-xs text-text-muted">
                            {(e.quantity * e.food.serving_size).toFixed(0)}
                            {e.food.serving_unit} · {Math.round(m.kcal)} kcal · P{" "}
                            {Math.round(m.protein_g)} / C {Math.round(m.carbs_g)} / G{" "}
                            {Math.round(m.fat_g)}
                          </Text>
                        </View>
                        <Pressable onPress={() => handleDeleteEntry(e.id)}>
                          <Text className="ml-2 text-red-400">×</Text>
                        </Pressable>
                      </View>
                    );
                  })}
                  <Text className="mt-2 text-right text-xs text-text-muted">
                    Total: {Math.round(macros.kcal)} kcal
                  </Text>
                </View>
              )}
            </Card>
          );
        })}
      </View>

      <View className="mt-8 gap-3">
        <Text className="text-sm font-semibold uppercase text-text-muted">
          Gerenciar
        </Text>
        <Link href="/foods" asChild>
          <Button variant="secondary" fullWidth>
            Biblioteca de alimentos
          </Button>
        </Link>
        <Link href="/targets" asChild>
          <Button variant="secondary" fullWidth>
            Metas de macros
          </Button>
        </Link>
      </View>
    </Screen>
  );
}
