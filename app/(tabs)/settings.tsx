import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import * as Sharing from "expo-sharing";
import { Link } from "expo-router";
import { Screen } from "@/src/components/Screen";
import { Card } from "@/src/components/Card";
import { Input } from "@/src/components/Input";
import { Button } from "@/src/components/Button";
import { useAsync } from "@/src/hooks/useAsync";
import {
  getAppSettings,
  setProgressionIncrement,
} from "@/src/repositories/settings";
import { getDBFileUri } from "@/src/db/client";
import { notifyError, notifySuccess } from "@/src/lib/toast";

export default function SettingsTab() {
  const settings = useAsync(() => getAppSettings(), []);
  const [increment, setIncrement] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings.data) {
      setIncrement(settings.data.progression_increment_kg.toString());
    }
  }, [settings.data]);

  async function handleSave() {
    const n = parseFloat(increment.replace(",", "."));
    if (!isFinite(n) || n <= 0) return;
    try {
      setSaving(true);
      await setProgressionIncrement(n);
      notifySuccess("Salvo.");
    } catch (e) {
      notifyError(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleExport() {
    try {
      const uri = getDBFileUri();
      const ok = await Sharing.isAvailableAsync();
      if (!ok) {
        notifyError("Share não disponível neste dispositivo.");
        return;
      }
      // Abre a share sheet do iOS — usuário escolhe AirDrop, iCloud, etc.
      await Sharing.shareAsync(uri, {
        dialogTitle: "Backup do fitness.db",
        UTI: "public.database",
        mimeType: "application/x-sqlite3",
      });
    } catch (e) {
      notifyError(e);
    }
  }

  return (
    <Screen>
      <Text className="mb-1 text-2xl font-bold text-text">Settings</Text>
      <Text className="mb-4 text-sm text-text-muted">
        Configurações pessoais e backup.
      </Text>

      <Card className="mb-4">
        <Text className="mb-2 text-base font-semibold text-text">
          Progressão de carga
        </Text>
        <Input
          label="Incremento sugerido (kg)"
          value={increment}
          onChangeText={setIncrement}
          keyboardType="decimal-pad"
          hint="Quanto somar quando você completou todas as séries no top do range."
        />
        <Button onPress={handleSave} loading={saving} fullWidth>
          Salvar
        </Button>
      </Card>

      <Card className="mb-4">
        <Text className="mb-2 text-base font-semibold text-text">
          Metas de macros
        </Text>
        <Text className="mb-3 text-sm text-text-muted">
          Edite suas calorias e macros diários.
        </Text>
        <Link href="/targets" asChild>
          <Button variant="secondary" fullWidth>
            Abrir metas
          </Button>
        </Link>
      </Card>

      <Card>
        <Text className="mb-2 text-base font-semibold text-text">
          Backup do banco
        </Text>
        <Text className="mb-3 text-sm text-text-muted">
          Exporta o arquivo `fitness.db` via share sheet (AirDrop, iCloud Drive, etc).
        </Text>
        <Button variant="secondary" onPress={handleExport} fullWidth>
          Exportar fitness.db
        </Button>
      </Card>

      <View className="mt-6 items-center">
        <Text className="text-xs text-text-muted">
          Versão 1.0.0 · 100% local-first · sem servidor
        </Text>
      </View>
    </Screen>
  );
}
