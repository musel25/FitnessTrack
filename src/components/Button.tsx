// Botão simples com variantes. `Pressable` é o componente moderno pra tap.
//
// Em React Native, NÃO existe um <button> nativo. Você usa <Pressable> e estiliza.
// `disabled` é uma prop booleana — quando true, ignora taps e aplica estilo cinza.

import { Pressable, Text, ActivityIndicator, View } from "react-native";
import { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type Props = {
  onPress?: () => void;
  children: ReactNode;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
};

const variants: Record<Variant, { bg: string; text: string; border: string }> =
  {
    primary: { bg: "bg-brand", text: "text-white", border: "border-brand" },
    secondary: {
      bg: "bg-bg-card",
      text: "text-text",
      border: "border-border",
    },
    ghost: { bg: "bg-transparent", text: "text-brand", border: "border-transparent" },
    danger: { bg: "bg-red-600", text: "text-white", border: "border-red-600" },
  };

export function Button({
  onPress,
  children,
  variant = "primary",
  disabled = false,
  loading = false,
  fullWidth = false,
  className = "",
}: Props) {
  const v = variants[variant];
  const opacity = disabled || loading ? "opacity-50" : "";
  const width = fullWidth ? "w-full" : "";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      // `active:opacity-80` é uma utilidade do NativeWind pra feedback de pressionado.
      className={`${v.bg} ${v.border} ${opacity} ${width} ${className} rounded-xl border px-4 py-3 active:opacity-80`}
    >
      <View className="flex-row items-center justify-center gap-2">
        {loading && <ActivityIndicator size="small" color="white" />}
        <Text className={`${v.text} text-center text-base font-semibold`}>
          {children as any}
        </Text>
      </View>
    </Pressable>
  );
}
