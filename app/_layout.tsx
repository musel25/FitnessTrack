// Layout root. Tudo do app passa por aqui.
//
// expo-router (file-based): cada arquivo em `app/` vira uma rota.
// `_layout.tsx` envolve as rotas-irmãs com um Stack/Navigator.
// `(tabs)/` é uma pasta-de-grupo — não aparece na URL mas agrupa rotas-irmãs.

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css"; // injeta os utilitários NativeWind no app inteiro

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          // Cabeçalhos com nossa paleta escura.
          headerStyle: { backgroundColor: "#0b0f14" },
          headerTintColor: "#f3f4f6",
          headerTitleStyle: { fontWeight: "600" },
          contentStyle: { backgroundColor: "#0b0f14" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="workout/session/[id]"
          options={{ title: "Treino em andamento" }}
        />
        <Stack.Screen
          name="workout/exercise/[id]"
          options={{ title: "Histórico do exercício" }}
        />
        <Stack.Screen name="exercises/index" options={{ title: "Exercícios" }} />
        <Stack.Screen name="exercises/new" options={{ title: "Novo exercício" }} />
        <Stack.Screen name="exercises/[id]/edit" options={{ title: "Editar exercício" }} />
        <Stack.Screen name="templates/index" options={{ title: "Templates" }} />
        <Stack.Screen name="templates/new" options={{ title: "Novo template" }} />
        <Stack.Screen name="templates/[id]/edit" options={{ title: "Editar template" }} />
        <Stack.Screen name="foods/index" options={{ title: "Alimentos" }} />
        <Stack.Screen name="foods/new" options={{ title: "Novo alimento" }} />
        <Stack.Screen name="foods/[id]/edit" options={{ title: "Editar alimento" }} />
        <Stack.Screen name="meals/add" options={{ title: "Adicionar refeição" }} />
        <Stack.Screen name="targets" options={{ title: "Metas de macros" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
