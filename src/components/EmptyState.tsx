import { Text, View } from "react-native";
import { ReactNode } from "react";

type Props = {
  title: string;
  hint?: string;
  action?: ReactNode;
};

export function EmptyState({ title, hint, action }: Props) {
  return (
    <View className="items-center justify-center rounded-2xl border border-dashed border-border p-8">
      <Text className="text-base font-semibold text-text">{title}</Text>
      {hint && (
        <Text className="mt-1 text-center text-sm text-text-muted">{hint}</Text>
      )}
      {action ? <View className="mt-4 w-full">{action}</View> : null}
    </View>
  );
}
