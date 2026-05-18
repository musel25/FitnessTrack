// Form compartilhado entre "novo" e "editar" exercício.
// Mantém o form simples — só name (obrigatório), grupo, notas.

import { useState } from "react";
import { View } from "react-native";
import { Input } from "./Input";
import { Button } from "./Button";
import { notifyError } from "@/src/lib/toast";

export type ExerciseFormValues = {
  name: string;
  muscle_group: string;
  notes: string;
};

type Props = {
  initial?: Partial<ExerciseFormValues>;
  submitLabel: string;
  onSubmit: (v: ExerciseFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
};

export function ExerciseForm({ initial, submitLabel, onSubmit, onDelete }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [muscleGroup, setMuscleGroup] = useState(initial?.muscle_group ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) return;
    try {
      setSaving(true);
      await onSubmit({ name, muscle_group: muscleGroup, notes });
    } catch (e) {
      notifyError(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View>
      <Input
        label="Nome"
        value={name}
        onChangeText={setName}
        placeholder="Supino reto, agachamento livre…"
        autoCapitalize="words"
      />
      <Input
        label="Grupo muscular (opcional)"
        value={muscleGroup}
        onChangeText={setMuscleGroup}
        placeholder="chest, back, legs, shoulders…"
      />
      <Input
        label="Notas (opcional)"
        value={notes}
        onChangeText={setNotes}
        placeholder="Dicas de execução, cuidados…"
        multiline
        numberOfLines={3}
      />
      <Button
        onPress={handleSubmit}
        disabled={!name.trim()}
        loading={saving}
        fullWidth
      >
        {submitLabel}
      </Button>
      {onDelete ? (
        <View className="mt-3">
          <Button variant="danger" onPress={onDelete} fullWidth>
            Excluir exercício
          </Button>
        </View>
      ) : null}
    </View>
  );
}
