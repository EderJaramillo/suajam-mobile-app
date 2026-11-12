import { Colors, fonts, iconStroke, radius, spacing } from "@/config/theme/theme";
import { ScanBarcode, Search } from "lucide-react-native";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onScan: () => void;
}

const ProductSearchBar = ({ value, onChangeText, onScan }: Props) => {
  return (
    <View style={styles.bar}>
      <Search size={20} color={Colors.textSecondary} strokeWidth={iconStroke} absoluteStrokeWidth />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Nombre, SKU, modelo o variante"
        placeholderTextColor={Colors.textSecondary}
        accessibilityLabel="Buscar productos"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      <Pressable
        onPress={onScan}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Escanear código"
      >
        <ScanBarcode size={24} color={Colors.primary} strokeWidth={iconStroke} absoluteStrokeWidth />
      </Pressable>
    </View>
  );
};

export default ProductSearchBar;

const styles = StyleSheet.create({
  bar: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: radius.sm,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
});
