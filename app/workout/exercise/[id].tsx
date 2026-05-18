// Histórico de um exercício: lista das últimas sessões + gráfico de progressão.
// Permite alternar o que está sendo plotado: top weight, volume total ou e1RM.

import { useMemo, useState } from "react";
import { View, Text, Dimensions, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { LineChart } from "react-native-gifted-charts";
import { Screen } from "@/src/components/Screen";
import { Card } from "@/src/components/Card";
import { EmptyState } from "@/src/components/EmptyState";
import { useAsync } from "@/src/hooks/useAsync";
import { getExercise } from "@/src/repositories/exercises";
import { getExerciseHistory } from "@/src/repositories/sessions";
import { fmtDateShort, fmtKg } from "@/src/lib/format";

type Metric = "top" | "volume" | "e1rm";

const METRIC_LABEL: Record<Metric, string> = {
  top: "Top set",
  volume: "Volume",
  e1rm: "e1RM",
};

export default function ExerciseHistory() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const exerciseId = Number(id);
  const exercise = useAsync(() => getExercise(exerciseId), [exerciseId]);
  const history = useAsync(() => getExerciseHistory(exerciseId, 20), [exerciseId]);
  const [metric, setMetric] = useState<Metric>("top");

  const chartData = useMemo(() => {
    if (!history.data) return [];
    return history.data.map((p) => ({
      value:
        metric === "top"
          ? p.top_weight
          : metric === "volume"
            ? p.total_volume
            : Math.round(p.est_1rm * 10) / 10,
      label: fmtDateShort(p.started_at).slice(0, 5), // dd/MM
      labelTextStyle: { color: "#9ca3af", fontSize: 10 },
    }));
  }, [history.data, metric]);

  const screenWidth = Dimensions.get("window").width;

  return (
    <Screen>
      <Text className="mb-1 text-2xl font-bold text-text">
        {exercise.data?.name ?? "—"}
      </Text>
      {exercise.data?.muscle_group ? (
        <Text className="mb-4 text-sm text-text-muted">
          {exercise.data.muscle_group}
        </Text>
      ) : null}

      {/* Toggle de métrica */}
      <View className="mb-4 flex-row gap-2">
        {(Object.keys(METRIC_LABEL) as Metric[]).map((m) => (
          <Pressable
            key={m}
            onPress={() => setMetric(m)}
            className={`rounded-lg border px-3 py-2 ${
              m === metric
                ? "border-brand bg-brand"
                : "border-border bg-bg-card"
            }`}
          >
            <Text
              className={
                m === metric
                  ? "text-sm font-semibold text-white"
                  : "text-sm text-text"
              }
            >
              {METRIC_LABEL[m]}
            </Text>
          </Pressable>
        ))}
      </View>

      {history.loading ? (
        <Text className="text-text-muted">Carregando…</Text>
      ) : chartData.length === 0 ? (
        <EmptyState
          title="Sem histórico ainda"
          hint="Faça este exercício em uma sessão pra começar a ver progressão."
        />
      ) : (
        <>
          <Card className="overflow-hidden">
            <LineChart
              data={chartData}
              width={screenWidth - 80}
              height={220}
              spacing={Math.max(28, (screenWidth - 120) / Math.max(chartData.length, 1))}
              initialSpacing={20}
              thickness={3}
              color="#0ea5e9"
              dataPointsColor="#38bdf8"
              dataPointsRadius={4}
              hideRules
              hideYAxisText={false}
              yAxisTextStyle={{ color: "#9ca3af", fontSize: 10 }}
              xAxisColor="#2a3441"
              yAxisColor="#2a3441"
              areaChart
              startFillColor="#0ea5e9"
              endFillColor="#0b0f14"
              startOpacity={0.4}
              endOpacity={0}
              curved
            />
          </Card>

          <Text className="mb-2 mt-6 text-base font-semibold text-text">
            Sessões
          </Text>
          <View className="gap-2">
            {[...history.data!].reverse().map((p) => (
              <Card key={p.session_id}>
                <View className="flex-row items-center justify-between">
                  <Text className="text-text">{fmtDateShort(p.started_at)}</Text>
                  <Text className="text-text-muted">
                    {fmtKg(p.top_weight)} × {p.top_reps} · vol {Math.round(p.total_volume)} · e1RM{" "}
                    {Math.round(p.est_1rm)}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}
