import { Colors, fonts, iconStroke, radius, spacing } from "@/config/theme/theme";
import { Eye, EyeOff } from "lucide-react-native";
import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import ThemedText from "./ThemedText";

interface Props extends TextInputProps {
  label: string;
  error?: string | null;
  isPassword?: boolean;
  accessory?: ReactNode;
  helperRight?: string;
}

const ThemedTextInput = ({ label, error, isPassword = false, accessory, helperRight, style, ...rest }: Props) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHidden, setIsHidden] = useState(true);

  const VisibilityIcon = isHidden ? Eye : EyeOff;
  const borderColor = error ? Colors.danger : isFocused ? Colors.primary : Colors.border;

  return (
    <View style={styles.field}>
      <ThemedText variant="label">{label}</ThemedText>

      <View style={[styles.input, { borderColor }]}>
        <TextInput
          {...rest}
          style={[styles.text, style]}
          placeholderTextColor={Colors.textSecondary}
          secureTextEntry={isPassword && isHidden}
          accessibilityLabel={label}
          onFocus={(e) => {
            setIsFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            rest.onBlur?.(e);
          }}
        />

        {accessory}

        {isPassword && (
          <Pressable
            onPress={() => setIsHidden((v) => !v)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={isHidden ? "Mostrar contraseña" : "Ocultar contraseña"}
          >
            <VisibilityIcon
              size={24}
              color={Colors.textSecondary}
              strokeWidth={iconStroke}
              absoluteStrokeWidth
            />
          </Pressable>
        )}
      </View>

      {error || helperRight ? (
        <View style={styles.helper}>
          <ThemedText variant="caption" color={Colors.danger} style={styles.helperError}>
            {error}
          </ThemedText>
          {helperRight ? (
            <ThemedText variant="caption" color={Colors.textSecondary}>
              {helperRight}
            </ThemedText>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

export default ThemedTextInput;

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs,
  },
  helper: {
    flexDirection: "row",
  },
  helperError: {
    flex: 1,
  },
  input: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: radius.sm,
    backgroundColor: Colors.surface,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  text: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
});
