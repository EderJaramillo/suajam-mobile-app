import { Colors, iconStroke, radius, spacing } from "@/config/theme/theme";
import { roleLabels, type Business } from "@/features/business/businessTypes";
import { ChevronRight, Store } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import ThemedText from "../ThemedText";

interface Props {
  business: Business;
  onPress: () => void;
}

const BusinessCard = ({ business, onPress }: Props) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${business.tenant_name}, ${roleLabels[business.role]}`}
    >
      <View style={styles.icon}>
        <Store size={24} color={Colors.primary} strokeWidth={iconStroke} absoluteStrokeWidth />
      </View>
      <View style={styles.content}>
        <ThemedText variant="bodyStrong" numberOfLines={1}>
          {business.tenant_name}
        </ThemedText>
        <ThemedText variant="caption" color={Colors.textSecondary} numberOfLines={1}>
          {business.tenant_slug} · {roleLabels[business.role] ?? business.role}
        </ThemedText>
      </View>
      <ChevronRight size={24} color={Colors.primary} strokeWidth={iconStroke} absoluteStrokeWidth />
    </Pressable>
  );
};

export default BusinessCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: radius.md,
  },
  pressed: {
    backgroundColor: Colors.selected,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: Colors.selected,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
});
