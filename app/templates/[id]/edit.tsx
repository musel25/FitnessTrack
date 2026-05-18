// Editor de template:
// - edita nome/notas inline
// - lista os exercícios em ordem, com edits de target_sets / target_reps
// - botão "↑↓" pra reordenar (simples; sem drag-and-drop pra evitar lib extra)
// - botão "+ Adicionar exercício" abre um picker
// - sal vamos o estado todo em uma transação só (setTemplateExercises)

import { useEffect, useMemo, useState } from "react";
import { View, Text, Modal, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/src/components/Screen";
import { Input } from "@/src/components/Input";
import { Button } from "@/src/components/Button";
import { Card } from "@/src/components/Card";
import { EmptyState } from "@/src/components/EmptyState";
import { useAsync } from "@/src/hooks/useAsync";
import {
  deleteTemplate,
  getTemplate,
  getTemplateExercises,
  setTemplateExercises,
  updateTemplate,
} from "@/src/repositories/templates";
import { listExercises } from "@/src/repositories/exercises";
import type { Exercise } from "@/src/db/types";
import { confirm, notifyError } from "@/src/lib/toast";

type Row = {
  exercise_id: number;
  exercise_name: string;
  target_sets: string; // strings nos inputs — convertemos ao salvar
  target_reps_min: string;
  target_reps_max: string;
};

export default function EditTemplate() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const templateId = Number(id);

  const template = useAsync(() => getTemplate(templateId), [templateId]);
  const initialExercises = useAsync(
    () => getTemplateExercises(templateId),
    [templateId]
  );

  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Quando os dados chegam, populamos o form local.
  // O `useEffect` aqui é o ponto onde a "fonte" do servidor entra no estado da UI.
  useEffect(() => {
    if (template.data) {
      setName(template.data.name);
      setNotes(template.data.notes ?? "");
    }
  }, [template.data]);

  useEffect(() => {
    if (initialExercises.data) {
      setRows(
        initialExercises.data.map((te) => ({
          exercise_id: te.exercise_id,
          exercise_name: te.exercise_name,
          target_sets: te.target_sets?.toString() ?? "",
          target_reps_min: te.target_reps_min?.toString() ?? "",
          target_reps_max: te.target_reps_max?.toString() ?? "",
        }))
      );
    }
  }, [initialExercises.data]);

  function moveUp(idx: number) {
    if (idx <= 0) return;
    const next = rows.slice();
    [next[idx - 1], next[idx]] = [next[idx]!, next[idx - 1]!];
    setRows(next);
  }
  function moveDown(idx: number) {
    if (idx >= rows.length - 1) return;
    const next = rows.slice();
    [next[idx + 1], next[idx]] = [next[idx]!, next[idx + 1]!];
    setRows(next);
  }
  function remove(idx: number) {
    setRows(rows.filter((_, i) => i !== idx));
  }
  function patch(idx: number, key: keyof Row, v: string) {
    const next = rows.slice();
    next[idx] = { ...next[idx]!, [key]: v };
    setRows(next);
  }
  function addExercise(ex: Exercise) {
    setRows((r) => [
      ...r,
      {
        exercise_id: ex.id,
        exercise_name: ex.name,
        target_sets: "3",
        target_reps_min: "8",
        target_reps_max: "12",
      },
    ]);
    setPickerOpen(false);
  }

  async function handleSave() {
    if (!name.trim()) return;
    try {
      setSaving(true);
      await updateTemplate(templateId, { name, notes: notes || null });
      await setTemplateExercises(
        templateId,
        rows.map((r) => ({
          exercise_id: r.exercise_id,
          target_sets: r.target_sets ? Number(r.target_sets) : null,
          target_reps_min: r.target_reps_min ? Number(r.target_reps_min) : null,
          target_reps_max: r.target_reps_max ? Number(r.target_reps_max) : null,
        }))
      );
      router.back();
    } catch (e) {
      notifyError(e);
    } finally {
      setSaving(false);
    }
  }

  if (template.loading || !template.data) {
    return (
      <Screen>
        <Text className="text-text-muted">Carregando…</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Input label="Nome" value={name} onChangeText={setName} />
      <Input label="Notas" value={notes} onChangeText={setNotes} multiline />

      <View className="mb-2 mt-2 flex-row items-center justify-between">
        <Text className="text-base font-semibold text-text">Exercícios</Text>
        <Button onPress={() => setPickerOpen(true)}>+ Adicionar</Button>
      </View>

      {rows.length === 0 ? (
        <EmptyState
          title="Sem exercícios"
          hint="Adicione exercícios na ordem que você os faz no treino."
        />
      ) : (
        <View className="gap-3">
          {rows.map((r, i) => (
            <Card key={`${r.exercise_id}-${i}`}>
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="flex-1 text-base font-semibold text-text">
                  {i + 1}. {r.exercise_name}
                </Text>
                <View className="flex-row gap-2">
                  <Button variant="secondary" onPress={() => moveUp(i)}>
                    ↑
                  </Button>
                  <Button variant="secondary" onPress={() => moveDown(i)}>
                    ↓
                  </Button>
                  <Button variant="danger" onPress={() => remove(i)}>
                    ✕
                  </Button>
                </View>
              </View>
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <Input
                    label="Séries"
                    value={r.target_sets}
                    onChangeText={(v) => patch(i, "target_sets", v)}
                    keyboardType="number-pad"
                    placeholder="3"
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Reps mín"
                    value={r.target_reps_min}
                    onChangeText={(v) => patch(i, "target_reps_min", v)}
                    keyboardType="number-pad"
                    placeholder="8"
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Reps máx"
                    value={r.target_reps_max}
                    onChangeText={(v) => patch(i, "target_reps_max", v)}
                    keyboardType="number-pad"
                    placeholder="12"
                  />
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      <View className="mt-6 gap-3">
        <Button
          fullWidth
          onPress={handleSave}
          disabled={!name.trim()}
          loading={saving}
        >
          Salvar
        </Button>
        <Button
          variant="danger"
          fullWidth
          onPress={() =>
            confirm(
              "Excluir template?",
              "Não afeta sessões já realizadas — só remove o template.",
              async () => {
                await deleteTemplate(templateId);
                router.back();
              },
              "Excluir"
            )
          }
        >
          Excluir template
        </Button>
      </View>

      <ExercisePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={addExercise}
        excludeIds={rows.map((r) => r.exercise_id)}
      />
    </Screen>
  );
}

// Modal nativo do RN. `Modal` empilha por cima do conteúdo.
function ExercisePicker({
  open,
  onClose,
  onPick,
  excludeIds,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (e: Exercise) => void;
  excludeIds: number[];
}) {
  const all = useAsync(() => listExercises(), []);
  const visible = useMemo(
    () => (all.data ?? []).filter((e) => !excludeIds.includes(e.id)),
    [all.data, excludeIds]
  );

  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-bg p-4 pt-12">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-xl font-bold text-text">
            Escolher exercício
          </Text>
          <Pressable onPress={onClose}>
            <Text className="text-base text-brand">Cancelar</Text>
          </Pressable>
        </View>
        <ScrollView className="flex-1">
          {visible.length === 0 ? (
            <EmptyState
              title="Nenhum exercício disponível"
              hint="Cadastre exercícios em Treinos → Biblioteca."
            />
          ) : (
            <View className="gap-2">
              {visible.map((e) => (
                <Card key={e.id} onPress={() => onPick(e)}>
                  <Text className="text-base font-semibold text-text">
                    {e.name}
                  </Text>
                  {e.muscle_group ? (
                    <Text className="text-sm text-text-muted">
                      {e.muscle_group}
                    </Text>
                  ) : null}
                </Card>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
