// Wrapper padrão de tela: SafeArea + fundo + ScrollView opcional.
// Uso: <Screen><...></Screen> em vez de copiar SafeAreaView toda hora.

import { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  children: ReactNode;
  scroll?: boolean;
  noPadding?: boolean;
};

export function Screen({ children, scroll = true, noPadding = false }: Props) {
  // `flex-1` faz a View ocupar todo o espaço disponível (flexbox padrão do RN).
  // `bg-bg` é nossa cor de fundo (definida em tailwind.config.js).
  const padding = noPadding ? "" : "px-4 pt-4 pb-8";

  if (scroll) {
    return (
      <SafeAreaView className="flex-1 bg-bg" edges={["top", "left", "right"]}>
        <ScrollView
          className="flex-1"
          contentContainerClassName={padding}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "left", "right"]}>
      <View className={`flex-1 ${padding}`}>{children}</View>
    </SafeAreaView>
  );
}
