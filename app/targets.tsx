// Edita as metas diárias de macros.

import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/src/components/Screen";
import { Input } from "@/src/components/Input";
import { Button } from "@/src/components/Button";
import { useAsync } from "@/src/hooks/useAsync";
import { getTargets, setTargets } from "@/src/repositories/settings";
import { notifyError, notifySuccess } from "@/src/lib/toast";

export default function TargetsScreen() {
  const router = useRouter();
  const current = useAsync(() => getTargets(), []);
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (current.data) {
      setKcal(current.data.kcal?.toString() ?? "");
      setProtein(current.data.protein_g?.toString() ?? "");
      setCarbs(current.data.carbs_g?.toString() ?? "");
      setFat(current.data.fat_g?.toString() ?? "");
    }
  }, [current.data]);

  async function handleSave() {
    try {
      setSaving(true);
      await setTargets({
        kcal: Number(kcal) || 0,
        protein_g: Number(protein) || 0,
        carbs_g: Number(carbs) || 0,
        fat_g: Number(fat) || 0,
      });
      notifySuccess("Metas atualizadas.");
      router.back();
    } catch (e) {
      notifyError(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <Text className="mb-4 text-sm text-text-muted">
        Defina seus targets diários. As barras na tela Dieta usam esses valores.
      </Text>
      <Input
        label="Calorias (kcal)"
        value={kcal}
        onChangeText={setKcal}
        keyboardType="decimal-pad"
      />
      <Input
        label="Proteína (g)"
        value={protein}
        onChangeText={setProtein}
        keyboardType="decimal-pad"
      />
      <Input
        label="Carboidratos (g)"
        value={carbs}
        onChangeText={setCarbs}
        keyboardType="decimal-pad"
      />
      <Input
        label="Gordura (g)"
        value={fat}
        onChangeText={setFat}
        keyboardType="decimal-pad"
      />
      <View className="mt-4">
        <Button onPress={handleSave} loading={saving} fullWidth>
          Salvar
        </Button>
      </View>
    </Screen>
  );
}
