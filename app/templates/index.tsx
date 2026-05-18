import { View, Text } from "react-native";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { Screen } from "@/src/components/Screen";
import { Card, CardSubtitle, CardTitle } from "@/src/components/Card";
import { Button } from "@/src/components/Button";
import { EmptyState } from "@/src/components/EmptyState";
import { useAsync } from "@/src/hooks/useAsync";
import { listTemplates } from "@/src/repositories/templates";

export default function TemplatesList() {
  const router = useRouter();
  const templates = useAsync(() => listTemplates(), []);

  useFocusEffect(
    useCallback(() => {
      templates.reload();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  return (
    <Screen>
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-text">Templates</Text>
        <Link href="/templates/new" asChild>
          <Button>+ Novo</Button>
        </Link>
      </View>

      {templates.loading ? (
        <Text className="text-text-muted">Carregando…</Text>
      ) : templates.data && templates.data.length > 0 ? (
        <View className="gap-2">
          {templates.data.map((t) => (
            <Card
              key={t.id}
              onPress={() => router.push(`/templates/${t.id}/edit`)}
            >
              <CardTitle>{t.name}</CardTitle>
              {t.notes ? <CardSubtitle>{t.notes}</CardSubtitle> : null}
            </Card>
          ))}
        </View>
      ) : (
        <EmptyState
          title="Sem templates"
          hint="Um template é a sequência de exercícios de um treino (Push, Pull, Legs…)."
          action={
            <Link href="/templates/new" asChild>
              <Button fullWidth>Criar primeiro template</Button>
            </Link>
          }
        />
      )}
    </Screen>
  );
}
