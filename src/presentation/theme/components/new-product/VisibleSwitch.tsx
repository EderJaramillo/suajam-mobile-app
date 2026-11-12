import { Colors, iconStroke, radius, touchTarget } from "@/config/theme/theme";
import { Lock } from "lucide-react-native";
import { Pressable, Switch, StyleSheet, View } from "react-native";

interface Props {
  value: boolean;
  onChange: (value: boolean) => void;
  // Bloqueado (sin precio o última variante visible): se muestra el candado del Figma.
  locked?: boolean;
  // Si el candado explica algo al tocarlo (Fase 3 / 29).
  onLockedPress?: () => void;
  label: string;
}

const VisibleSwitch = ({ value, onChange, locked = false, onLockedPress, label }: Props) => {
  if (locked) {
    return (
      <Pressable
        onPress={onLockedPress}
        disabled={!onLockedPress}
        style={styles.container}
        accessibilityRole="switch"
        accessibilityLabel={label}
        accessibilityHint={onLockedPress ? "Explica por qué no se puede cambiar" : undefined}
        accessibilityState={{ disabled: true, checked: value }}
      >
        <View style={styles.locked}>
          <Lock size={14} color={Colors.textSecondary} strokeWidth={iconStroke} absoluteStrokeWidth />
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: Colors.border, true: Colors.success }}
        thumbColor={Colors.surface}
        ios_backgroundColor={Colors.border}
        accessibilityLabel={label}
      />
    </View>
  );
};

export default VisibleSwitch;

const styles = StyleSheet.create({
  container: {
    minWidth: 52,
    height: touchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  locked: {
    width: 48,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: Colors.disabled,
    alignItems: "center",
    justifyContent: "center",
  },
});
