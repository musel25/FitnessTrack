import { Pressable, View, Text } from "react-native";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  onPress?: () => void;
  className?: string;
};

export function Card({ children, onPress, className = "" }: Props) {
  const base =
    "rounded-2xl border border-border bg-bg-card p-4";
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={`${base} active:opacity-80 ${className}`}
      >
        {children}
      </Pressable>
    );
  }
  return <View className={`${base} ${className}`}>{children}</View>;
}

export function CardTitle({ children }: { children: ReactNode }) {
  return (
    <Text className="text-lg font-semibold text-text">{children as any}</Text>
  );
}

export function CardSubtitle({ children }: { children: ReactNode }) {
  return (
    <Text className="text-sm text-text-muted">{children as any}</Text>
  );
}
