// Cria template "vazio" — só com nome/notas. Depois redireciona pro editor,
// onde adicionamos os exercícios.

import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/src/components/Screen";
import { Input } from "@/src/components/Input";
import { Button } from "@/src/components/Button";
import { createTemplate } from "@/src/repositories/templates";
import { notifyError } from "@/src/lib/toast";

export default function NewTemplate() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    try {
      setSaving(true);
      const id = await createTemplate({ name, notes: notes || null });
      // `replace` pra não acumular a tela de "novo" no stack history.
      router.replace(`/templates/${id}/edit`);
    } catch (e) {
      notifyError(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <View>
        <Input
          label="Nome"
          placeholder="Push Day, Pull Day, Leg Day…"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        <Input
          label="Notas (opcional)"
          value={notes}
          onChangeText={setNotes}
          multiline
        />
        <Button
          onPress={handleCreate}
          disabled={!name.trim()}
          loading={saving}
          fullWidth
        >
          Criar e adicionar exercícios
        </Button>
      </View>
    </Screen>
  );
}
