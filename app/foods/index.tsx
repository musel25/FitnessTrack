import { useCallback, useState } from "react";
import { View, Text } from "react-native";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { Screen } from "@/src/components/Screen";
import { Card } from "@/src/components/Card";
import { Button } from "@/src/components/Button";
import { Input } from "@/src/components/Input";
import { EmptyState } from "@/src/components/EmptyState";
import { useAsync } from "@/src/hooks/useAsync";
import { listFoods } from "@/src/repositories/foods";

export default function FoodsList() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const foods = useAsync(() => listFoods(query), [query]);

  useFocusEffect(
    useCallback(() => {
      foods.reload();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  return (
    <Screen>
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-text">Alimentos</Text>
        <Link href="/foods/new" asChild>
          <Button>+ Novo</Button>
        </Link>
      </View>

      <Input
        placeholder="Buscar…"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
      />

      {foods.loading ? (
        <Text className="text-text-muted">Carregando…</Text>
      ) : foods.data && foods.data.length > 0 ? (
        <View className="gap-2">
          {foods.data.map((f) => (
            <Card key={f.id} onPress={() => router.push(`/foods/${f.id}/edit`)}>
              <Text className="text-base font-semibold text-text">
                {f.name}
                {f.brand ? <Text className="text-text-muted"> · {f.brand}</Text> : null}
              </Text>
              <Text className="text-xs text-text-muted">
                {f.serving_size}
                {f.serving_unit} · {Math.round(f.kcal)} kcal · P{" "}
                {Math.round(f.protein_g)} / C {Math.round(f.carbs_g)} / G{" "}
                {Math.round(f.fat_g)}
              </Text>
            </Card>
          ))}
        </View>
      ) : (
        <EmptyState
          title="Nenhum alimento"
          hint="Cadastre os alimentos da sua rotina pra acelerar o log diário."
          action={
            <Link href="/foods/new" asChild>
              <Button fullWidth>Adicionar primeiro alimento</Button>
            </Link>
          }
        />
      )}
    </Screen>
  );
}
