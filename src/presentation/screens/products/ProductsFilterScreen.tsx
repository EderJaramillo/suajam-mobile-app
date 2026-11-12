import { Colors, iconStroke, radius, spacing } from "@/config/theme/theme";
import { setCategoryFilter, setSearch, setTypeFilter } from "@/features/products/productsSlice";
import { productTypes } from "@/features/products/productsTypes";
import AppBar from "@/presentation/theme/components/AppBar";
import BottomNav from "@/presentation/theme/components/BottomNav";
import ProductSearchBar from "@/presentation/theme/components/products/ProductSearchBar";
import ThemedButton from "@/presentation/theme/components/ThemedButton";
import ThemedText from "@/presentation/theme/components/ThemedText";
import ThemedTextInput from "@/presentation/theme/components/ThemedTextInput";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { router, useLocalSearchParams } from "expo-router";
import { Circle, CircleDot } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Option {
  id: number | null;
  label: string;
}

// Fase 2 / 07 (categoría) y 08 (tipo): cambian las opciones, no la estructura.
const ProductsFilterScreen = () => {
  const dispatch = useAppDispatch();
  const { kind } = useLocalSearchParams<{ kind: "category" | "type" }>();
  const { categories, categoryId, typeId, search } = useAppSelector((s) => s.products);

  const isCategory = kind === "category";
  const [selectedId, setSelectedId] = useState(isCategory ? categoryId : typeId);
  const [categoryQuery, setCategoryQuery] = useState("");

  const options: Option[] = isCategory
    ? [
        { id: null, label: "Todas las categorías" },
        ...categories
          .filter((c) => c.name.toLowerCase().includes(categoryQuery.trim().toLowerCase()))
          .map((c) => ({ id: c.id, label: c.name })),
      ]
    : [{ id: null, label: "Todos los tipos" }, ...productTypes];

  const apply = (id: number | null) => {
    dispatch(isCategory ? setCategoryFilter(id) : setTypeFilter(id));
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <AppBar title="Filtrar productos" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ProductSearchBar
          value={search}
          onChangeText={(text) => dispatch(setSearch(text))}
          onScan={() => router.push("/scanner")}
        />
        <ThemedText variant="caption" color={Colors.textSecondary}>
          2 filtros disponibles · Todos los productos
        </ThemedText>

        <View style={styles.sheet}>
          <View style={styles.handle} />
          <ThemedText variant="title" accessibilityRole="header">
            {isCategory ? "Categoría" : "Tipo de producto"}
          </ThemedText>

          {isCategory && (
            <ThemedTextInput
              label="Buscar categoría"
              placeholder="Escribe una categoría"
              value={categoryQuery}
              onChangeText={setCategoryQuery}
            />
          )}

          {options.map(({ id, label }) => {
            const isSelected = id === selectedId;
            const Icon = isSelected ? CircleDot : Circle;
            return (
              <Pressable
                key={label}
                onPress={() => setSelectedId(id)}
                style={styles.option}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                hitSlop={8}
              >
                <Icon
                  size={24}
                  color={isSelected ? Colors.primary : Colors.textSecondary}
                  strokeWidth={iconStroke}
                  absoluteStrokeWidth
                />
                <ThemedText variant="bodyMedium">{label}</ThemedText>
              </Pressable>
            );
          })}

          <ThemedButton title="Aplicar filtro" onPress={() => apply(selectedId)} />
          <ThemedButton title="Limpiar filtro" variant="text" onPress={() => apply(null)} />
        </View>
      </ScrollView>

      <BottomNav active="products" onSelect={() => router.back()} />
    </SafeAreaView>
  );
};

export default ProductsFilterScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: spacing.lg,
    // Figma: 16 de margen + 15 de la línea vacía + 12 de separación.
    paddingTop: 43,
    gap: spacing.md,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.lg,
    shadowColor: "#291140",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
});
