// Adicionar uma entrada de refeição:
// - recebe { date, meal_type } via query params (vem da tela Dieta)
// - busca alimento na biblioteca (ou cria novo via atalho)
// - escolhe quantidade (multiplicador da serving_size)
// - salva e volta

import { useMemo, useState } from "react";
import { View, Text } from "react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/src/components/Screen";
import { Input } from "@/src/components/Input";
import { Button } from "@/src/components/Button";
import { Card } from "@/src/components/Card";
import { EmptyState } from "@/src/components/EmptyState";
import { useAsync } from "@/src/hooks/useAsync";
import { listFoods } from "@/src/repositories/foods";
import { addMealEntry, getOrCreateMeal } from "@/src/repositories/meals";
import { macrosForEntry } from "@/src/lib/macros";
import { mealTypeLabel } from "@/src/lib/format";
import type { Food, MealType } from "@/src/db/types";
import { notifyError } from "@/src/lib/toast";

export default function AddMealEntry() {
  const router = useRouter();
  const { date, meal_type } = useLocalSearchParams<{
    date: string;
    meal_type: MealType;
  }>();

  const [query, setQuery] = useState("");
  const foods = useAsync(() => listFoods(query), [query]);
  const [selected, setSelected] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [saving, setSaving] = useState(false);

  const previewMacros = useMemo(() => {
    if (!selected) return null;
    const q = parseFloat(quantity.replace(",", "."));
    if (!isFinite(q) || q <= 0) return null;
    return macrosForEntry(selected, q);
  }, [selected, quantity]);

  async function handleSave() {
    if (!selected) return;
    const q = parseFloat(quantity.replace(",", "."));
    if (!isFinite(q) || q <= 0) return;
    try {
      setSaving(true);
      const mealId = await getOrCreateMeal(date, meal_type);
      await addMealEntry(mealId, selected.id, q);
      router.back();
    } catch (e) {
      notifyError(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <Text className="mb-1 text-2xl font-bold text-text">
        {mealTypeLabel(meal_type)}
      </Text>
      <Text className="mb-4 text-sm text-text-muted">{date}</Text>

      {selected ? (
        <Card className="mb-4">
          <View className="mb-2 flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="text-base font-semibold text-text">
                {selected.name}
              </Text>
              {selected.brand ? (
                <Text className="text-sm text-text-muted">{selected.brand}</Text>
              ) : null}
              <Text className="text-xs text-text-muted">
                {selected.serving_size}
                {selected.serving_unit} = {Math.round(selected.kcal)} kcal
              </Text>
            </View>
            <Button variant="ghost" onPress={() => setSelected(null)}>
              Trocar
            </Button>
          </View>
          <Input
            label={`Quantidade (× ${selected.serving_size}${selected.serving_unit})`}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="decimal-pad"
            hint={`Ex: 1.5 = ${(selected.serving_size * 1.5).toFixed(0)}${selected.serving_unit}`}
          />
          {previewMacros && (
            <View className="mt-2 rounded-lg bg-bg-input p-3">
              <Text className="text-sm text-text">
                {Math.round(previewMacros.kcal)} kcal · P{" "}
                {Math.round(previewMacros.protein_g)} / C{" "}
                {Math.round(previewMacros.carbs_g)} / G{" "}
                {Math.round(previewMacros.fat_g)}
              </Text>
            </View>
          )}
          <View className="mt-4">
            <Button onPress={handleSave} loading={saving} fullWidth>
              Adicionar
            </Button>
          </View>
        </Card>
      ) : (
        <>
          <Input
            placeholder="Buscar alimento…"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
          />

          {foods.loading ? (
            <Text className="text-text-muted">Carregando…</Text>
          ) : foods.data && foods.data.length > 0 ? (
            <View className="gap-2">
              {foods.data.map((f) => (
                <Card key={f.id} onPress={() => setSelected(f)}>
                  <Text className="text-base text-text">
                    {f.name}
                    {f.brand ? (
                      <Text className="text-text-muted"> · {f.brand}</Text>
                    ) : null}
                  </Text>
                  <Text className="text-xs text-text-muted">
                    {f.serving_size}
                    {f.serving_unit} · {Math.round(f.kcal)} kcal
                  </Text>
                </Card>
              ))}
            </View>
          ) : (
            <EmptyState
              title="Nenhum alimento encontrado"
              hint="Cadastre alimentos antes de logar refeições."
              action={
                <Link href="/foods/new" asChild>
                  <Button fullWidth>+ Novo alimento</Button>
                </Link>
              }
            />
          )}

          <View className="mt-6">
            <Link href="/foods/new" asChild>
              <Button variant="ghost" fullWidth>
                + Criar alimento novo
              </Button>
            </Link>
          </View>
        </>
      )}
    </Screen>
  );
}
