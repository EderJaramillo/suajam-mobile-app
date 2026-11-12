import { Colors, fonts, spacing } from "@/config/theme/theme";
import ThemedText from "@/presentation/theme/components/ThemedText";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Fase 1 / 01 / Splash — se muestra mientras se revisa si hay sesión guardada.
const SplashView = () => {
  const { top, bottom } = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: top, paddingBottom: Math.max(bottom, 24) }]}>
      <StatusBar style="light" />
      <View style={styles.brand}>
        <ThemedText color={Colors.onPrimary} style={styles.wordmark}>
          Suajam
        </ThemedText>
        <ThemedText variant="caption" color={Colors.onPrimary}>
          CATÁLOGO DE PRODUCTOS
        </ThemedText>
      </View>
      <ThemedText variant="caption" color={Colors.onPrimary} align="center">
        Tu negocio, siempre a la mano.
      </ThemedText>
    </View>
  );
};

export default SplashView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  brand: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
  wordmark: {
    fontFamily: fonts.bold,
    fontSize: 48,
    lineHeight: 58,
  },
});
