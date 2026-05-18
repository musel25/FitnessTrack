// Lista de exercícios. Tap → editar. Botão flutuante → novo.

import { View, Text } from "react-native";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { Screen } from "@/src/components/Screen";
import { Card, CardSubtitle, CardTitle } from "@/src/components/Card";
import { Button } from "@/src/components/Button";
import { EmptyState } from "@/src/components/EmptyState";
import { useAsync } from "@/src/hooks/useAsync";
import { listExercises } from "@/src/repositories/exercises";

export default function ExercisesList() {
  const router = useRouter();
  const exercises = useAsync(() => listExercises(), []);

  useFocusEffect(
    useCallback(() => {
      exercises.reload();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  return (
    <Screen>
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-text">Biblioteca</Text>
        <Link href="/exercises/new" asChild>
          <Button>+ Novo</Button>
        </Link>
      </View>

      {exercises.loading ? (
        <Text className="text-text-muted">Carregando…</Text>
      ) : exercises.data && exercises.data.length > 0 ? (
        <View className="gap-2">
          {exercises.data.map((e) => (
            <Card
              key={e.id}
              onPress={() => router.push(`/exercises/${e.id}/edit`)}
            >
              <CardTitle>{e.name}</CardTitle>
              {e.muscle_group ? (
                <CardSubtitle>{e.muscle_group}</CardSubtitle>
              ) : null}
            </Card>
          ))}
        </View>
      ) : (
        <EmptyState
          title="Nenhum exercício"
          hint="Cadastra os exercícios que você faz pra poder usá-los nos templates."
          action={
            <Link href="/exercises/new" asChild>
              <Button fullWidth>Adicionar primeiro exercício</Button>
            </Link>
          }
        />
      )}
    </Screen>
  );
}
