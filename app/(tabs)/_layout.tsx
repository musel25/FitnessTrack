// Define a barra de tabs (rodapé). Cada `Tabs.Screen` aponta pra um arquivo em (tabs)/.

import { Tabs } from "expo-router";
import { Text } from "react-native";

// Usamos emoji como ícone pra não depender de uma lib de ícones agora.
// Pra trocar por @expo/vector-icons depois, basta substituir aqui.
function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: focused ? 24 : 22, opacity: focused ? 1 : 0.6 }}>
      {emoji}
    </Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#0b0f14" },
        headerTintColor: "#f3f4f6",
        headerTitleStyle: { fontWeight: "600" },
        tabBarStyle: {
          backgroundColor: "#0b0f14",
          borderTopColor: "#2a3441",
        },
        tabBarActiveTintColor: "#0ea5e9",
        tabBarInactiveTintColor: "#9ca3af",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Treino",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏋️" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="diet"
        options={{
          title: "Dieta",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🥗" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="⚙️" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
