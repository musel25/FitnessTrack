// Sessão ativa de treino — o coração do app.
//
// Pra cada exercício do template (ou pra cada exercício adicionado em treino livre):
// - mostra o que foi feito na ÚLTIMA sessão desse exercício (peso × reps).
// - mostra os sets já registrados na sessão atual.
// - sugere a próxima carga a usar, com base na regra simples em `progression.ts`.
// - permite adicionar nova série (peso, reps, RPE opcional, warmup?).

import { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Modal, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/src/components/Screen";
import { Button } from "@/src/components/Button";
import { Input } from "@/src/components/Input";
import { Card } from "@/src/components/Card";
import { useAsync } from "@/src/hooks/useAsync";
import { getSession, endSession, deleteSession } from "@/src/repositories/sessions";
import { getTemplate, getTemplateExercises } from "@/src/repositories/templates";
import { listExercises } from "@/src/repositories/exercises";
import {
  addSet,
  deleteSet,
  getLastSetsForExercise,
  getSetsForExerciseInSession,
} from "@/src/repositories/sessions";
import { getAppSettings } from "@/src/repositories/settings";
import { suggestNextWeight } from "@/src/lib/progression";
import { fmtKg, fmtDuration } from "@/src/lib/format";
import type {
  Exercise,
  SessionSet,
  TemplateExerciseWithDetails,
} from "@/src/db/types";
import { confirm, notifyError } from "@/src/lib/toast";

// Tipo unificado: cada "card de exercício" na sessão pode vir do template ou ser ad-hoc.
type SessionExercise = {
  exercise_id: number;
  exercise_name: string;
  target_sets: number | null;
  target_reps_min: number | null;
  target_reps_max: number | null;
};

export default function ActiveSession() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionId = Number(id);

  const session = useAsync(() => getSession(sessionId), [sessionId]);
  const settings = useAsync(() => getAppSettings(), []);

  const [exercises, setExercises] = useState<SessionExercise[]>([]);
  const [picking, setPicking] = useState(false);

  // Quando a sessão carrega, populamos a lista de exercícios:
  // - do template se houver
  // - vazia se treino livre (usuário adiciona via "+ Adicionar exercício")
  useEffect(() => {
    if (!session.data) return;
    if (session.data.template_id) {
      void (async () => {
        const tplEx = await getTemplateExercises(session.data!.template_id!);
        setExercises(toSessionExercises(tplEx));
      })();
    }
  }, [session.data]);

  if (session.loading || !session.data) {
    return (
      <Screen>
        <Text className="text-text-muted">Carregando…</Text>
      </Screen>
    );
  }

  async function handleFinish() {
    try {
      await endSession(sessionId);
      router.back();
    } catch (e) {
      notifyError(e);
    }
  }

  function handleCancel() {
    confirm(
      "Descartar sessão?",
      "Vai apagar todas as séries registradas nesta sessão.",
      async () => {
        try {
          await deleteSession(sessionId);
          router.back();
        } catch (e) {
          notifyError(e);
        }
      },
      "Descartar"
    );
  }

  function addAdHocExercise(ex: Exercise) {
    setExercises((cur) => {
      // Se já existe no plano, não duplica.
      if (cur.some((c) => c.exercise_id === ex.id)) return cur;
      return [
        ...cur,
        {
          exercise_id: ex.id,
          exercise_name: ex.name,
          target_sets: null,
          target_reps_min: null,
          target_reps_max: null,
        },
      ];
    });
    setPicking(false);
  }

  return (
    <Screen>
      <View className="mb-4 rounded-2xl bg-bg-card p-4">
        <Text className="text-xs uppercase text-text-muted">Em andamento</Text>
        <Text className="text-lg font-semibold text-text">
          Sessão #{sessionId} ·{" "}
          {fmtDuration(session.data.started_at, session.data.ended_at)}
        </Text>
      </View>

      {exercises.length === 0 ? (
        <Text className="mb-4 text-text-muted">
          Treino livre — adicione exercícios abaixo.
        </Text>
      ) : null}

      <View className="gap-4">
        {exercises.map((ex) => (
          <ExerciseSection
            key={ex.exercise_id}
            sessionId={sessionId}
            exercise={ex}
            progressionIncrement={settings.data?.progression_increment_kg ?? 2.5}
          />
        ))}
      </View>

      <View className="mt-4">
        <Button variant="secondary" onPress={() => setPicking(true)} fullWidth>
          + Adicionar exercício
        </Button>
      </View>

      <View className="mt-8 gap-3">
        <Button onPress={handleFinish} fullWidth>
          Finalizar treino
        </Button>
        <Button variant="danger" onPress={handleCancel} fullWidth>
          Descartar
        </Button>
      </View>

      <AdHocPicker
        open={picking}
        onClose={() => setPicking(false)}
        onPick={addAdHocExercise}
        excludeIds={exercises.map((e) => e.exercise_id)}
      />
    </Screen>
  );
}

// Conversor: template_exercises -> SessionExercise (campos do React-state).
function toSessionExercises(
  tpl: TemplateExerciseWithDetails[]
): SessionExercise[] {
  return tpl.map((t) => ({
    exercise_id: t.exercise_id,
    exercise_name: t.exercise_name,
    target_sets: t.target_sets,
    target_reps_min: t.target_reps_min,
    target_reps_max: t.target_reps_max,
  }));
}

// ---------- ExerciseSection ----------

function ExerciseSection({
  sessionId,
  exercise,
  progressionIncrement,
}: {
  sessionId: number;
  exercise: SessionExercise;
  progressionIncrement: number;
}) {
  const router = useRouter();
  const currentSets = useAsync(
    () => getSetsForExerciseInSession(sessionId, exercise.exercise_id),
    [sessionId, exercise.exercise_id]
  );
  const lastSets = useAsync(
    () => getLastSetsForExercise(exercise.exercise_id, sessionId),
    [exercise.exercise_id, sessionId]
  );

  // Sugestão de carga: se tem última sessão, calcula. Se não, fica nulo.
  const suggestedWeight = useMemo(() => {
    if (!lastSets.data) return null;
    return suggestNextWeight({
      lastSets: lastSets.data,
      targetRepsMax: exercise.target_reps_max,
      increment: progressionIncrement,
    });
  }, [lastSets.data, exercise.target_reps_max, progressionIncrement]);

  // Form local — peso/reps/rpe pra próxima série.
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [rpe, setRpe] = useState("");
  const [warmup, setWarmup] = useState(false);

  // Quando a sugestão atualiza (primeira carga, depois de criar sets, etc),
  // se o input ainda está vazio, pré-preenche.
  useEffect(() => {
    if (suggestedWeight != null && weight === "") {
      setWeight(suggestedWeight.toString());
    }
    if (exercise.target_reps_min && reps === "") {
      setReps(exercise.target_reps_min.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedWeight]);

  async function handleAdd() {
    const w = parseFloat(weight.replace(",", "."));
    const r = parseInt(reps, 10);
    if (!isFinite(w) || w <= 0 || !isFinite(r) || r <= 0) return;
    try {
      await addSet({
        session_id: sessionId,
        exercise_id: exercise.exercise_id,
        weight: w,
        reps: r,
        rpe: rpe ? parseFloat(rpe.replace(",", ".")) : null,
        is_warmup: warmup,
      });
      // Limpa apenas reps/rpe; peso continua pra próxima série.
      setReps("");
      setRpe("");
      setWarmup(false);
      currentSets.reload();
    } catch (e) {
      notifyError(e);
    }
  }

  async function handleDeleteSet(setId: number) {
    try {
      await deleteSet(setId);
      currentSets.reload();
    } catch (e) {
      notifyError(e);
    }
  }

  const targetRangeText =
    exercise.target_sets && exercise.target_reps_min
      ? `${exercise.target_sets} × ${exercise.target_reps_min}-${exercise.target_reps_max ?? "?"}`
      : null;

  return (
    <Card>
      <View className="mb-3 flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-base font-semibold text-text">
            {exercise.exercise_name}
          </Text>
          {targetRangeText && (
            <Text className="text-xs text-text-muted">
              Alvo: {targetRangeText}
            </Text>
          )}
        </View>
        <Pressable
          onPress={() =>
            router.push(`/workout/exercise/${exercise.exercise_id}`)
          }
        >
          <Text className="text-sm text-brand">Histórico</Text>
        </Pressable>
      </View>

      {/* Última sessão */}
      <View className="mb-3 rounded-xl border border-border bg-bg-input p-3">
        <Text className="mb-1 text-xs uppercase text-text-muted">
          Última sessão
        </Text>
        {lastSets.loading ? (
          <Text className="text-text-muted">…</Text>
        ) : lastSets.data && lastSets.data.length > 0 ? (
          <View className="flex-row flex-wrap gap-2">
            {lastSets.data.map((s) => (
              <SetBadge key={s.id} set={s} />
            ))}
          </View>
        ) : (
          <Text className="text-sm text-text-muted">
            Primeira vez fazendo esse exercício.
          </Text>
        )}
        {suggestedWeight != null && (
          <Text className="mt-2 text-xs text-text-muted">
            Sugestão hoje: <Text className="text-text">{fmtKg(suggestedWeight)}</Text>
          </Text>
        )}
      </View>

      {/* Séries da sessão atual */}
      {currentSets.data && currentSets.data.length > 0 && (
        <View className="mb-3">
          <Text className="mb-1 text-xs uppercase text-text-muted">
            Hoje
          </Text>
          {currentSets.data.map((s) => (
            <View
              key={s.id}
              className="mb-1 flex-row items-center justify-between rounded-lg bg-bg-input px-3 py-2"
            >
              <Text className="text-text">
                #{s.set_number} · {fmtKg(s.weight)} × {s.reps}
                {s.rpe != null ? ` @${s.rpe}` : ""}
                {s.is_warmup ? "  (warmup)" : ""}
              </Text>
              <Pressable onPress={() => handleDeleteSet(s.id)}>
                <Text className="text-red-400">×</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {/* Form de adicionar */}
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Input
            label="Peso (kg)"
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            placeholder="0"
          />
        </View>
        <View className="flex-1">
          <Input
            label="Reps"
            value={reps}
            onChangeText={setReps}
            keyboardType="number-pad"
            placeholder="0"
          />
        </View>
        <View className="flex-1">
          <Input
            label="RPE"
            value={rpe}
            onChangeText={setRpe}
            keyboardType="decimal-pad"
            placeholder="—"
          />
        </View>
      </View>
      <Pressable
        onPress={() => setWarmup((w) => !w)}
        className="mb-3 flex-row items-center gap-2"
      >
        <View
          className={`h-5 w-5 rounded border ${warmup ? "border-brand bg-brand" : "border-border"}`}
        />
        <Text className="text-sm text-text">Warm-up (não conta no volume)</Text>
      </Pressable>
      <Button onPress={handleAdd} fullWidth>
        Adicionar série
      </Button>
    </Card>
  );
}

function SetBadge({ set }: { set: SessionSet }) {
  return (
    <View className="rounded-md border border-border px-2 py-1">
      <Text className="text-xs text-text">
        {fmtKg(set.weight)} × {set.reps}
        {set.is_warmup ? " w" : ""}
      </Text>
    </View>
  );
}

// Picker reusado pra adicionar exercício em treino livre.
function AdHocPicker({
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
          <Text className="text-xl font-bold text-text">Adicionar</Text>
          <Pressable onPress={onClose}>
            <Text className="text-base text-brand">Cancelar</Text>
          </Pressable>
        </View>
        <ScrollView className="flex-1">
          {visible.length === 0 ? (
            <Text className="text-text-muted">
              Sem exercícios disponíveis.
            </Text>
          ) : (
            <View className="gap-2">
              {visible.map((e) => (
                <Card key={e.id} onPress={() => onPick(e)}>
                  <Text className="text-base text-text">{e.name}</Text>
                </Card>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
