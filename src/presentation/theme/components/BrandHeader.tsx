import { Colors, spacing } from "@/config/theme/theme";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import ThemedText from "./ThemedText";

interface Props {
  withBar?: boolean;
}

const BrandHeader = ({ withBar = false }: Props) => {
  return (
    <View style={styles.container}>
      {withBar && (
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.bar}
        />
      )}
      <View style={styles.brand} accessibilityRole="header">
        <ThemedText variant="wordmark" color={Colors.primary}>
          Suajam
        </ThemedText>
        <ThemedText variant="overline" color={Colors.textSecondary}>
          CATÁLOGO DE PRODUCTOS
        </ThemedText>
      </View>
    </View>
  );
};

export default BrandHeader;

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  bar: {
    height: 4,
  },
  brand: {
    gap: spacing.sm,
  },
});
