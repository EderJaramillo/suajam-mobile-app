import { Colors, iconStroke, spacing, touchTarget } from "@/config/theme/theme";
import { ArrowLeft, Ellipsis, type LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import ThemedText from "./ThemedText";

interface Props {
  title: string;
  onBack?: () => void;
  onAction?: () => void;
  actionIcon?: LucideIcon;
  actionLabel?: string;
}

const AppBar = ({
  title,
  onBack,
  onAction,
  actionIcon: ActionIcon = Ellipsis,
  actionLabel = "Más opciones",
}: Props) => {
  return (
    <View style={styles.bar}>
      {onBack && (
        <Pressable
          onPress={onBack}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <ArrowLeft size={24} color={Colors.primary} strokeWidth={iconStroke} absoluteStrokeWidth />
        </Pressable>
      )}
      <ThemedText variant="subtitle" numberOfLines={1} style={styles.title} accessibilityRole="header">
        {title}
      </ThemedText>
      <Pressable
        onPress={onAction}
        disabled={!onAction}
        style={styles.iconButton}
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
      >
        <ActionIcon size={24} color={Colors.primary} strokeWidth={iconStroke} absoluteStrokeWidth />
      </Pressable>
    </View>
  );
};

export default AppBar;

const styles = StyleSheet.create({
  bar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    backgroundColor: Colors.surface,
    gap: spacing.sm,
  },
  iconButton: {
    width: touchTarget,
    height: touchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
  },
});
