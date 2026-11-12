import { Colors, fonts, iconStroke, radius, spacing, touchTarget } from "@/config/theme/theme";
import { Check } from "lucide-react-native";
import { Pressable, StyleSheet, Text } from "react-native";

interface Props {
  label: string;
  selected?: boolean;
  // Fase 3 / 37: las etiquetas elegidas llevan palomita.
  showCheck?: boolean;
  onPress: () => void;
}

const FilterChip = ({ label, selected = false, showCheck = false, onPress }: Props) => {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
      {showCheck && selected && (
        <Check size={14} color={Colors.primary} strokeWidth={iconStroke} absoluteStrokeWidth />
      )}
    </Pressable>
  );
};

export default FilterChip;

const styles = StyleSheet.create({
  chip: {
    height: touchTarget,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: radius.sm,
  },
  selected: {
    backgroundColor: Colors.selected,
    borderColor: Colors.primary,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  selectedLabel: {
    color: Colors.primary,
  },
});
