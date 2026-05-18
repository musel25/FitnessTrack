import { Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/src/components/Screen";
import { FoodForm } from "@/src/components/FoodForm";
import { useAsync } from "@/src/hooks/useAsync";
import { deleteFood, getFood, updateFood } from "@/src/repositories/foods";
import { confirm } from "@/src/lib/toast";

export default function EditFood() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const foodId = Number(id);
  const food = useAsync(() => getFood(foodId), [foodId]);

  if (food.loading || !food.data) {
    return (
      <Screen>
        <Text className="text-text-muted">Carregando…</Text>
      </Screen>
    );
  }

  const f = food.data;

  return (
    <Screen>
      <FoodForm
        initial={{
          name: f.name,
          brand: f.brand ?? "",
          serving_size: f.serving_size.toString(),
          serving_unit: f.serving_unit,
          kcal: f.kcal.toString(),
          protein_g: f.protein_g.toString(),
          carbs_g: f.carbs_g.toString(),
          fat_g: f.fat_g.toString(),
          fiber_g: f.fiber_g != null ? f.fiber_g.toString() : "",
        }}
        submitLabel="Salvar alterações"
        onSubmit={async (v) => {
          await updateFood(foodId, {
            name: v.name,
            brand: v.brand || null,
            serving_size: Number(v.serving_size),
            serving_unit: v.serving_unit || "g",
            kcal: Number(v.kcal || 0),
            protein_g: Number(v.protein_g || 0),
            carbs_g: Number(v.carbs_g || 0),
            fat_g: Number(v.fat_g || 0),
            fiber_g: v.fiber_g ? Number(v.fiber_g) : null,
          });
          router.back();
        }}
        onDelete={async () => {
          confirm(
            "Excluir alimento?",
            "Vai remover este alimento e todos os registros de refeição que o usam.",
            async () => {
              await deleteFood(foodId);
              router.back();
            },
            "Excluir"
          );
        }}
      />
    </Screen>
  );
}
