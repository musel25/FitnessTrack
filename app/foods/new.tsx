import { useRouter } from "expo-router";
import { Screen } from "@/src/components/Screen";
import { FoodForm } from "@/src/components/FoodForm";
import { createFood } from "@/src/repositories/foods";

export default function NewFood() {
  const router = useRouter();
  return (
    <Screen>
      <FoodForm
        submitLabel="Criar"
        onSubmit={async (v) => {
          await createFood({
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
      />
    </Screen>
  );
}
