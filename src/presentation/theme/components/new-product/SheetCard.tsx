import { Colors, radius, spacing } from "@/config/theme/theme";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import ThemedText from "../ThemedText";

interface Props {
  title: string;
  children: ReactNode;
}

// Bottom sheet del Figma: agarre, título y contenido.
const SheetCard = ({ title, children }: Props) => {
  return (
    <View style={styles.sheet}>
      <View style={styles.handle} />
      <ThemedText variant="title" accessibilityRole="header">
        {title}
      </ThemedText>
      {children}
    </View>
  );
};

export default SheetCard;

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.lg,
    shadowColor: "#291140",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
});
