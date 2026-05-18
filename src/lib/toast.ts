// Wrapper minimalista pra mensagens de erro/sucesso.
// Em RN sem libs extras, `Alert.alert()` é o mais simples e nativo.
//
// Pra trocar por um toast bonito depois, basta editar daqui.

import { Alert } from "react-native";

export function notifyError(err: unknown, fallback = "Algo deu errado") {
  const msg = err instanceof Error ? err.message : String(err ?? fallback);
  console.error("[err]", err);
  Alert.alert("Erro", msg);
}

export function notifySuccess(message: string) {
  Alert.alert("OK", message);
}

export function confirm(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmLabel = "Confirmar"
) {
  Alert.alert(title, message, [
    { text: "Cancelar", style: "cancel" },
    { text: confirmLabel, style: "destructive", onPress: onConfirm },
  ]);
}
