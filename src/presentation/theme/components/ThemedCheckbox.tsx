import { Colors, iconStroke, spacing } from "@/config/theme/theme";
import { Square, SquareCheck } from "lucide-react-native";
import { Pressable, StyleSheet } from "react-native";
import ThemedText from "./ThemedText";

interface Props {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ThemedCheckbox = ({ label, checked, onChange }: Props) => {
  const Icon = checked ? SquareCheck : Square;

  return (
    <Pressable
      onPress={() => onChange(!checked)}
      style={styles.row}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      hitSlop={12}
    >
      <Icon
        size={24}
        color={checked ? Colors.primary : Colors.textSecondary}
        strokeWidth={iconStroke}
        absoluteStrokeWidth
      />
      <ThemedText variant="bodyMedium">{label}</ThemedText>
    </Pressable>
  );
};

export default ThemedCheckbox;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    alignSelf: "flex-start",
  },
});
