// Form de alimento. Compartilhado entre new e edit.

import { useState } from "react";
import { View, Text } from "react-native";
import { Input } from "./Input";
import { Button } from "./Button";
import { notifyError } from "@/src/lib/toast";

export type FoodFormValues = {
  name: string;
  brand: string;
  serving_size: string;
  serving_unit: string;
  kcal: string;
  protein_g: string;
  carbs_g: string;
  fat_g: string;
  fiber_g: string;
};

const EMPTY: FoodFormValues = {
  name: "",
  brand: "",
  serving_size: "100",
  serving_unit: "g",
  kcal: "",
  protein_g: "",
  carbs_g: "",
  fat_g: "",
  fiber_g: "",
};

type Props = {
  initial?: Partial<FoodFormValues>;
  submitLabel: string;
  onSubmit: (v: FoodFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
};

export function FoodForm({ initial, submitLabel, onSubmit, onDelete }: Props) {
  const [v, setV] = useState<FoodFormValues>({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);

  function set<K extends keyof FoodFormValues>(k: K, val: FoodFormValues[K]) {
    setV((cur) => ({ ...cur, [k]: val }));
  }

  const isValid =
    v.name.trim().length > 0 &&
    Number(v.serving_size) > 0 &&
    !isNaN(Number(v.kcal)) &&
    !isNaN(Number(v.protein_g)) &&
    !isNaN(Number(v.carbs_g)) &&
    !isNaN(Number(v.fat_g));

  async function handleSubmit() {
    if (!isValid) return;
    try {
      setSaving(true);
      await onSubmit(v);
    } catch (e) {
      notifyError(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View>
      <Input
        label="Nome"
        value={v.name}
        onChangeText={(x) => set("name", x)}
        placeholder="Arroz cozido"
        autoCapitalize="sentences"
      />
      <Input
        label="Marca (opcional)"
        value={v.brand}
        onChangeText={(x) => set("brand", x)}
      />

      <Text className="mb-1 text-sm text-text-muted">Porção de referência</Text>
      <View className="mb-2 flex-row gap-2">
        <View className="flex-1">
          <Input
            value={v.serving_size}
            onChangeText={(x) => set("serving_size", x)}
            keyboardType="decimal-pad"
            placeholder="100"
          />
        </View>
        <View className="w-24">
          <Input
            value={v.serving_unit}
            onChangeText={(x) => set("serving_unit", x)}
            placeholder="g/ml/unit"
            autoCapitalize="none"
          />
        </View>
      </View>

      <Text className="mb-1 text-sm text-text-muted">
        Macros por {v.serving_size || "?"} {v.serving_unit}
      </Text>
      <Input
        label="Calorias (kcal)"
        value={v.kcal}
        onChangeText={(x) => set("kcal", x)}
        keyboardType="decimal-pad"
      />
      <Input
        label="Proteína (g)"
        value={v.protein_g}
        onChangeText={(x) => set("protein_g", x)}
        keyboardType="decimal-pad"
      />
      <Input
        label="Carboidratos (g)"
        value={v.carbs_g}
        onChangeText={(x) => set("carbs_g", x)}
        keyboardType="decimal-pad"
      />
      <Input
        label="Gordura (g)"
        value={v.fat_g}
        onChangeText={(x) => set("fat_g", x)}
        keyboardType="decimal-pad"
      />
      <Input
        label="Fibra (g, opcional)"
        value={v.fiber_g}
        onChangeText={(x) => set("fiber_g", x)}
        keyboardType="decimal-pad"
      />

      <Button
        onPress={handleSubmit}
        disabled={!isValid}
        loading={saving}
        fullWidth
      >
        {submitLabel}
      </Button>
      {onDelete ? (
        <View className="mt-3">
          <Button variant="danger" onPress={onDelete} fullWidth>
            Excluir alimento
          </Button>
        </View>
      ) : null}
    </View>
  );
}
