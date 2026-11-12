import { Colors, fonts, radius, spacing } from "@/config/theme/theme";
import { StyleSheet, Text, TextInput, View } from "react-native";
import ThemedText from "../ThemedText";

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const cleanAmount = (text: string) => text.replace(/[^0-9.]/g, "");

// Campo de dinero con el "$" del Figma (Costo / Precio de venta).
const AmountField = ({ label, value, onChange }: Props) => (
  <View style={styles.field}>
    <ThemedText variant="label">{label}</ThemedText>
    <View style={styles.input}>
      <Text style={styles.currency}>$</Text>
      <TextInput
        style={styles.text}
        value={value}
        onChangeText={(text) => onChange(cleanAmount(text))}
        keyboardType="decimal-pad"
        accessibilityLabel={label}
      />
    </View>
  </View>
);

export default AmountField;

const styles = StyleSheet.create({
  field: {
    flex: 1,
    gap: spacing.xs,
  },
  input: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: radius.sm,
  },
  currency: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: Colors.textSecondary,
  },
  text: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
});
