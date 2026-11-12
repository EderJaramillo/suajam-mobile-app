import { Colors, iconStroke, radius, spacing, typography } from "@/config/theme/theme";
import { LoaderCircle, type LucideIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";

type Variant = "primary" | "outline" | "text" | "destructive";

interface Props {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: LucideIcon;
  loading?: boolean;
  loadingTitle?: string;
  disabled?: boolean;
}

const Spinner = ({ color }: { color: string }) => {
  const [rotation] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [rotation]);

  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <LoaderCircle size={20} color={color} strokeWidth={iconStroke} absoluteStrokeWidth />
    </Animated.View>
  );
};

const ThemedButton = ({
  title,
  onPress,
  variant = "primary",
  icon: Icon,
  loading = false,
  loadingTitle,
  disabled = false,
}: Props) => {
  const isFilled = variant === "primary" || variant === "destructive";
  const isInactive = disabled || loading;
  const isDisabledFilled = isFilled && disabled && !loading;
  const contentColor = isDisabledFilled
    ? Colors.textSecondary
    : isFilled
      ? Colors.onPrimary
      : Colors.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={isInactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: isInactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" && styles.primary,
        variant === "destructive" && styles.destructive,
        variant === "outline" && styles.outline,
        isDisabledFilled && styles.disabledFilled,
        !isFilled && disabled && !loading && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <Spinner color={contentColor} />
        ) : Icon ? (
          <Icon size={20} color={contentColor} strokeWidth={iconStroke} absoluteStrokeWidth />
        ) : null}
        <Text style={[styles.label, { color: contentColor }]}>
          {loading && loadingTitle ? loadingTitle : title}
        </Text>
      </View>
    </Pressable>
  );
};

export default ThemedButton;

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  destructive: {
    backgroundColor: Colors.danger,
  },
  disabledFilled: {
    backgroundColor: Colors.disabled,
  },
  outline: {
    borderColor: Colors.primary,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  label: {
    ...typography.bodyStrong,
  },
});
