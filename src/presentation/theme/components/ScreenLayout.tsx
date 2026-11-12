import { Colors, spacing } from "@/config/theme/theme";
import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  compactTop?: boolean;
}

// Estructura que repiten todas las pantallas del Figma:
// barra de aplicación (opcional) + contenido desplazable + acciones inferiores fijas.
const ScreenLayout = ({ children, header, footer, compactTop = false }: Props) => {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {header}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.content, compactTop && styles.compactTop]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ScreenLayout;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    // Figma: 16 de margen + 15 de la línea vacía + 12 de separación.
    paddingTop: 43,
    gap: spacing.md,
  },
  compactTop: {
    paddingTop: spacing.lg,
  },
  footer: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
});
