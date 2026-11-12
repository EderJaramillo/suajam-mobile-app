import { Colors, fonts, iconStroke, radius, spacing } from "@/config/theme/theme";
import { Bold, List, Smile, type LucideIcon } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import ThemedText from "../ThemedText";

interface Props {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}

// Fase 3 / 34: descripción con barra "Texto · Lista · Emojis".
// La API guarda texto plano: negritas con **texto** y listas con "• ".
const DescriptionField = ({ value, onChange, error }: Props) => {
  const [selection, setSelection] = useState({ start: value.length, end: value.length });

  const insert = (before: string, after = "") => {
    const { start, end } = selection;
    const selected = value.slice(start, end);
    onChange(value.slice(0, start) + before + selected + after + value.slice(end));
  };

  const tools: { icon: LucideIcon; label: string; onPress?: () => void }[] = [
    { icon: Bold, label: "Negritas", onPress: () => insert("**", "**") },
    {
      icon: List,
      label: "Lista",
      onPress: () => insert(selection.start === 0 || value[selection.start - 1] === "\n" ? "• " : "\n• "),
    },
    // Los emojis se eligen desde el teclado del teléfono: el ícono solo lo indica.
    { icon: Smile, label: "Emojis desde el teclado" },
  ];

  return (
    <View style={styles.field}>
      <ThemedText variant="label">Descripción *</ThemedText>
      <View style={[styles.box, error && styles.boxError]}>
        <View style={styles.toolbar}>
          {tools.map(({ icon: Icon, label, onPress }) => (
            <Pressable
              key={label}
              onPress={onPress}
              disabled={!onPress}
              hitSlop={8}
              accessibilityRole={onPress ? "button" : "image"}
              accessibilityLabel={label}
            >
              <Icon size={22} color={Colors.primary} strokeWidth={iconStroke} absoluteStrokeWidth />
            </Pressable>
          ))}
          <ThemedText variant="caption" color={Colors.textSecondary}>
            Texto · Lista · Emojis
          </ThemedText>
        </View>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
          placeholder="Cuéntale a tu cliente qué hace especial a tu producto."
          placeholderTextColor={Colors.textSecondary}
          multiline
          textAlignVertical="top"
          accessibilityLabel="Descripción"
        />
      </View>
      {error && (
        <ThemedText variant="caption" color={Colors.danger}>
          {error}
        </ThemedText>
      )}
    </View>
  );
};

export default DescriptionField;

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs,
  },
  box: {
    gap: spacing.sm,
    padding: spacing.md,
    minHeight: 112,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: radius.sm,
  },
  boxError: {
    borderColor: Colors.danger,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  input: {
    minHeight: 60,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 20,
    color: Colors.textPrimary,
    padding: 0,
  },
});
