import { Colors, iconStroke, radius, spacing } from "@/config/theme/theme";
import { createCategory, updateDraft } from "@/features/products/newProductSlice";
import { fetchCategories } from "@/features/products/productsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Circle, CircleDot, Plus } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import InfoBanner from "../InfoBanner";
import ThemedButton from "../ThemedButton";
import ThemedText from "../ThemedText";
import ThemedTextInput from "../ThemedTextInput";
import SheetCard from "./SheetCard";

interface Props {
  visible: boolean;
  onClose: () => void;
}

// Fase 3 / 03 (elegir) y 04 (crear): las dos vistas viven en el mismo bottom sheet.
const CategorySheet = ({ visible, onClose }: Props) => {
  const dispatch = useAppDispatch();
  const { bottom } = useSafeAreaInsets();
  const categories = useAppSelector((s) => s.products.categories);
  const { category, isSaving, error } = useAppSelector((s) => s.newProduct);

  const [mode, setMode] = useState<"pick" | "create">("pick");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");

  // Cada vez que se abre empieza en "elegir" con la categoría actual marcada.
  const onShow = () => {
    setMode("pick");
    setQuery("");
    setNewName("");
    setSelectedId(category?.id ?? null);
    dispatch(fetchCategories());
  };

  const visibleCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const onChoose = () => {
    const chosen = categories.find((c) => c.id === selectedId);
    if (chosen) dispatch(updateDraft({ category: chosen }));
    onClose();
  };

  const onCreate = async () => {
    const result = await dispatch(createCategory(newName));
    if (createCategory.fulfilled.match(result)) onClose();
  };

  const isPicking = mode === "pick";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onShow={onShow}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.overlay} onPress={onClose} accessibilityLabel="Cerrar" />

        <View style={[styles.sheet, { paddingBottom: Math.max(bottom, spacing.lg) }]}>
          <ScrollView keyboardShouldPersistTaps="handled" bounces={false}>
            <SheetCard title={isPicking ? "Elige una categoría" : "Crear categoría"}>
              {isPicking ? (
                <>
                  <ThemedTextInput
                    label="Buscar categoría"
                    placeholder="Ej. Ropa"
                    value={query}
                    onChangeText={setQuery}
                  />

                  {visibleCategories.map((item) => {
                    const isSelected = item.id === selectedId;
                    const Icon = isSelected ? CircleDot : Circle;
                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => setSelectedId(item.id)}
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
                        <ThemedText variant="bodyMedium">{item.name}</ThemedText>
                      </Pressable>
                    );
                  })}

                  <ThemedButton
                    title="Crear categoría"
                    variant="text"
                    icon={Plus}
                    onPress={() => setMode("create")}
                  />
                </>
              ) : (
                <>
                  <ThemedTextInput
                    label="Nombre de la categoría *"
                    placeholder="Ej. Ropa para diario"
                    value={newName}
                    onChangeText={setNewName}
                    maxLength={100}
                    autoFocus
                  />
                  <ThemedText variant="caption" color={Colors.textSecondary}>
                    Se agregará a las categorías de tu negocio.
                  </ThemedText>
                  {error && <InfoBanner tone="error" message={error} />}
                </>
              )}

              {isPicking ? (
                <ThemedButton title="Elegir categoría" disabled={!selectedId} onPress={onChoose} />
              ) : (
                <>
                  <ThemedButton
                    title="Crear y seleccionar"
                    loading={isSaving}
                    loadingTitle="Guardando…"
                    disabled={!newName.trim()}
                    onPress={onCreate}
                  />
                  <ThemedButton title="Volver" variant="text" onPress={() => setMode("pick")} />
                </>
              )}
            </SheetCard>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CategorySheet;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
  },
  sheet: {
    maxHeight: "85%",
    backgroundColor: Colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: "hidden",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
});
