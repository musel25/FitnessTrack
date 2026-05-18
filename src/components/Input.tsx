// Input de texto com label opcional. Wrapper enxuto sobre TextInput nativo.
//
// Props "controlled": valor vem de fora (state do componente pai) via `value`,
// e o pai recebe mudanças via `onChangeText`. Mesmo padrão do React web.

import { TextInput, View, Text } from "react-native";
import { ComponentProps } from "react";

type Props = {
  label?: string;
  error?: string;
  hint?: string;
} & ComponentProps<typeof TextInput>;

export function Input({ label, error, hint, className, ...rest }: Props) {
  return (
    <View className="mb-3">
      {label && (
        <Text className="mb-1 text-sm text-text-muted">{label}</Text>
      )}
      <TextInput
        // placeholderTextColor é obrigatório no RN — não dá pra estilizar via CSS.
        placeholderTextColor="#6b7280"
        className={`rounded-xl border border-border bg-bg-input px-4 py-3 text-base text-text ${className ?? ""}`}
        {...rest}
      />
      {error ? (
        <Text className="mt-1 text-xs text-red-400">{error}</Text>
      ) : hint ? (
        <Text className="mt-1 text-xs text-text-muted">{hint}</Text>
      ) : null}
    </View>
  );
}
