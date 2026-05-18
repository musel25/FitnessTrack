// Tab Treino — home.
// Lista templates de treino com botão "Começar treino". Atalhos pra Exercícios e Templates.

import { View, Text } from "react-native";
import { Link, useRouter, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Screen } from "@/src/components/Screen";
import { Button } from "@/src/components/Button";
import { Card, CardSubtitle, CardTitle } from "@/src/components/Card";
import { EmptyState } from "@/src/components/EmptyState";
import { useAsync } from "@/src/hooks/useAsync";
import { listTemplates } from "@/src/repositories/templates";
import { startSession } from "@/src/repositories/sessions";
import { notifyError } from "@/src/lib/toast";

export default function WorkoutsHome() {
  const router = useRouter();
  const templates = useAsync(() => listTemplates(), []);

  // `useFocusEffect` (expo-router) roda quando a tela vira foco. Útil pra recarregar
  // dados depois que o usuário criou/editou um template em outra tela.
  useFocusEffect(
    useCallback(() => {
      templates.reload();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  async function onStart(templateId: number | null) {
    try {
      const sessionId = await startSession(templateId);
      router.push(`/workout/session/${sessionId}`);
    } catch (e) {
      notifyError(e);
    }
  }

  return (
    <Screen>
      <Text className="mb-1 text-2xl font-bold text-text">Treinos</Text>
      <Text className="mb-4 text-sm text-text-muted">
        Escolha um template e começa.
      </Text>

      {/* Templates */}
      {templates.loading ? (
        <Text className="text-text-muted">Carregando…</Text>
      ) : templates.data && templates.data.length > 0 ? (
        <View className="gap-3">
          {templates.data.map((t) => (
            <Card key={t.id}>
              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-1">
                  <CardTitle>{t.name}</CardTitle>
                  {t.notes ? <CardSubtitle>{t.notes}</CardSubtitle> : null}
                </View>
                <Button onPress={() => onStart(t.id)}>Começar</Button>
              </View>
            </Card>
          ))}
        </View>
      ) : (
        <EmptyState
          title="Sem templates ainda"
          hint="Crie seu primeiro template (Push, Pull, Legs…)"
          action={
            <Link href="/templates/new" asChild>
              <Button fullWidth>Criar template</Button>
            </Link>
          }
        />
      )}

      {/* Atalho: treino livre */}
      <View className="mt-6">
        <Button variant="secondary" onPress={() => onStart(null)} fullWidth>
          + Treino livre (sem template)
        </Button>
      </View>

      {/* Atalhos pra gestão */}
      <View className="mt-8 gap-3">
        <Text className="text-sm font-semibold uppercase text-text-muted">
          Gerenciar
        </Text>
        <Link href="/templates" asChild>
          <Button variant="secondary" fullWidth>
            Templates de treino
          </Button>
        </Link>
        <Link href="/exercises" asChild>
          <Button variant="secondary" fullWidth>
            Biblioteca de exercícios
          </Button>
        </Link>
      </View>
    </Screen>
  );
}
