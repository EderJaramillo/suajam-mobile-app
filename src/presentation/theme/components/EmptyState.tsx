import { Colors, iconStroke, radius, spacing } from "@/config/theme/theme";
import type { LucideIcon } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import ThemedText from "./ThemedText";

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
}

// Ícono en círculo lila + título + descripción (pantallas de bloqueo, correo enviado, etc.)
const EmptyState = ({ icon: Icon, title, description }: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.illustration}>
        <Icon size={56} color={Colors.primary} strokeWidth={iconStroke} absoluteStrokeWidth />
      </View>
      <ThemedText variant="title" align="center" accessibilityRole="header">
        {title}
      </ThemedText>
      <ThemedText align="center" color={Colors.textSecondary}>
        {description}
      </ThemedText>
    </View>
  );
};

export default EmptyState;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    gap: spacing.lg,
  },
  illustration: {
    width: 112,
    height: 112,
    borderRadius: radius.full,
    backgroundColor: Colors.selected,
    alignItems: "center",
    justifyContent: "center",
  },
});
