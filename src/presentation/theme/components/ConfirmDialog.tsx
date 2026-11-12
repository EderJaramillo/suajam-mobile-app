import { Colors, iconStroke, radius, spacing } from "@/config/theme/theme";
import type { LucideIcon } from "lucide-react-native";
import { Modal, StyleSheet, View } from "react-native";
import ThemedButton from "./ThemedButton";
import ThemedText from "./ThemedText";

interface Props {
  visible: boolean;
  icon: LucideIcon;
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant?: "destructive" | "primary";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  cancelLabel?: string;
}

const ConfirmDialog = ({
  visible,
  icon: Icon,
  title,
  description,
  confirmLabel,
  confirmVariant = "destructive",
  loading = false,
  onConfirm,
  onCancel,
  cancelLabel = "Volver",
}: Props) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.dialog} accessibilityViewIsModal>
          <Icon size={24} color={Colors.primary} strokeWidth={iconStroke} absoluteStrokeWidth />
          <ThemedText variant="title" accessibilityRole="header">
            {title}
          </ThemedText>
          <ThemedText color={Colors.textSecondary}>{description}</ThemedText>
          <ThemedButton
            title={confirmLabel}
            variant={confirmVariant}
            loading={loading}
            onPress={onConfirm}
          />
          <ThemedButton title={cancelLabel} variant="text" onPress={onCancel} />
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmDialog;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "center",
    padding: spacing.lg,
  },
  dialog: {
    backgroundColor: Colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.lg,
  },
});
