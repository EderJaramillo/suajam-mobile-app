import { Colors, iconStroke, radius, spacing } from "@/config/theme/theme";
import { Circle, CircleDot, Package, type LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import ThemedText from "../ThemedText";

interface Props {
  title: string;
  description: string;
  diagram: string;
  icon: LucideIcon;
  selected: boolean;
  collapsed: boolean;
  onPress: () => void;
}

const stroke = { strokeWidth: iconStroke, absoluteStrokeWidth: true };

const ProductTypeCard = ({
  title,
  description,
  diagram,
  icon: Icon,
  selected,
  collapsed,
  onPress,
}: Props) => {
  const RadioIcon = selected ? CircleDot : Circle;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, selected && styles.selected]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <View style={styles.row}>
        <RadioIcon size={20} color={Colors.primary} {...stroke} />
        <ThemedText variant="subtitle" style={styles.title}>
          {title}
        </ThemedText>
        <Icon size={20} color={Colors.primary} {...stroke} />
      </View>
      {!collapsed && (
        <>
          <ThemedText variant="caption" color={Colors.textSecondary}>
            {description}
          </ThemedText>
          <View style={styles.row}>
            <Package size={20} color={Colors.primary} {...stroke} />
            <ThemedText variant="caption" color={Colors.primary} style={styles.title}>
              {diagram}
            </ThemedText>
          </View>
        </>
      )}
    </Pressable>
  );
};

export default ProductTypeCard;

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: radius.md,
    shadowColor: "#291140",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  selected: {
    backgroundColor: Colors.selected,
    borderColor: Colors.primary,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    flex: 1,
  },
});
