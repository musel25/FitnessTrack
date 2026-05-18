import { useRouter } from "expo-router";
import { Screen } from "@/src/components/Screen";
import { ExerciseForm } from "@/src/components/ExerciseForm";
import { createExercise } from "@/src/repositories/exercises";

export default function NewExercise() {
  const router = useRouter();

  return (
    <Screen>
      <ExerciseForm
        submitLabel="Criar"
        onSubmit={async (v) => {
          await createExercise({
            name: v.name,
            muscle_group: v.muscle_group || null,
            notes: v.notes || null,
          });
          router.back();
        }}
      />
    </Screen>
  );
}
