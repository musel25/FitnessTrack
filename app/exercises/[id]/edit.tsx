import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "react-native";
import { Screen } from "@/src/components/Screen";
import { ExerciseForm } from "@/src/components/ExerciseForm";
import { useAsync } from "@/src/hooks/useAsync";
import {
  deleteExercise,
  getExercise,
  updateExercise,
} from "@/src/repositories/exercises";
import { confirm } from "@/src/lib/toast";

export default function EditExercise() {
  const router = useRouter();
  // `useLocalSearchParams` lê os params da rota (`[id]` da pasta).
  // Tipa como string sempre — convertemos pra number na hora de usar.
  const { id } = useLocalSearchParams<{ id: string }>();
  const exerciseId = Number(id);

  const exercise = useAsync(() => getExercise(exerciseId), [exerciseId]);

  if (exercise.loading || !exercise.data) {
    return (
      <Screen>
        <Text className="text-text-muted">Carregando…</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <ExerciseForm
        initial={{
          name: exercise.data.name,
          muscle_group: exercise.data.muscle_group ?? "",
          notes: exercise.data.notes ?? "",
        }}
        submitLabel="Salvar alterações"
        onSubmit={async (v) => {
          await updateExercise(exerciseId, {
            name: v.name,
            muscle_group: v.muscle_group || null,
            notes: v.notes || null,
          });
          router.back();
        }}
        onDelete={async () => {
          confirm(
            "Excluir exercício?",
            "Isto remove o exercício e TODAS as séries históricas dele. Não dá pra desfazer.",
            async () => {
              await deleteExercise(exerciseId);
              router.back();
            },
            "Excluir"
          );
        }}
      />
    </Screen>
  );
}
