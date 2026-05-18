// Barra de progresso simples (atual / alvo). Mostra o número e a barra.
//
// Em RN não tem <progress>, então renderizamos duas <View> sobrepostas:
// uma "track" cinza por trás e uma "fill" colorida proporcional.

import { View, Text } from "react-native";
import { progress } from "@/src/lib/macros";

type Props = {
  label: string;
  current: number;
  target: number | null;
  unit?: string;
  color?: string; // classe Tailwind para a barra
};

export function MacroBar({
  label,
  current,
  target,
  unit = "g",
  color = "bg-brand",
}: Props) {
  const ratio = Math.min(1, progress(current, target));
  // % como string pra width — tipamos como template literal pra agradar o TS.
  const pct = `${Math.round(ratio * 100)}%` as `${number}%`;
  const targetStr = target != null ? `${Math.round(target)}${unit}` : "—";

  return (
    <View className="mb-3">
      <View className="mb-1 flex-row items-baseline justify-between">
        <Text className="text-sm text-text-muted">{label}</Text>
        <Text className="text-sm font-medium text-text">
          {Math.round(current)}
          {unit}{" "}
          <Text className="text-text-muted">/ {targetStr}</Text>
        </Text>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-bg-input">
        <View
          className={`h-2 ${color}`}
          // width inline porque Tailwind não suporta valores dinâmicos em runtime.
          style={{ width: pct }}
        />
      </View>
    </View>
  );
}
