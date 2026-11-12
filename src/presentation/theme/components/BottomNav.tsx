import { Colors, fonts, iconStroke, spacing } from "@/config/theme/theme";
import { Images, Package, UserRound, type LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import ThemedText from "./ThemedText";

type Tab = "products" | "gallery" | "account";

const tabs: { key: Tab; label: string; icon: LucideIcon }[] = [
  { key: "products", label: "Productos", icon: Package },
  { key: "gallery", label: "Galería", icon: Images },
  { key: "account", label: "Cuenta", icon: UserRound },
];

interface Props {
  active: Tab;
  onSelect: (tab: Tab) => void;
}

const BottomNav = ({ active, onSelect }: Props) => {
  return (
    <View style={styles.bar}>
      {tabs.map(({ key, label, icon: Icon }) => {
        const isActive = key === active;
        const color = isActive ? Colors.primary : Colors.textSecondary;
        return (
          <Pressable
            key={key}
            onPress={() => onSelect(key)}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Icon size={22} color={color} strokeWidth={iconStroke} absoluteStrokeWidth />
            <ThemedText variant="caption" color={color} style={isActive && styles.activeLabel}>
              {label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
};

export default BottomNav;

const styles = StyleSheet.create({
  bar: {
    height: 64,
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  activeLabel: {
    fontFamily: fonts.semibold,
  },
});
