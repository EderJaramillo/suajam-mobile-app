import { Colors, radius, spacing } from "@/config/theme/theme";
import {
  fetchFilterCatalog,
  saveLabelSelection,
  startEditingLabels,
  toggleLabel,
} from "@/features/products/newProductSlice";
import InfoBanner from "@/presentation/theme/components/InfoBanner";
import NewProductLayout from "@/presentation/theme/components/new-product/NewProductLayout";
import FilterChip from "@/presentation/theme/components/products/FilterChip";
import ThemedButton from "@/presentation/theme/components/ThemedButton";
import ThemedText from "@/presentation/theme/components/ThemedText";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useAfterSave } from "@/presentation/screens/products/sections/useSectionSaved";
import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";

// Fase 3 / 37: cada filtro es una tarjeta con sus etiquetas; se pueden elegir varias.
const LabelsScreen = () => {
  const dispatch = useAppDispatch();
  const { filterCatalog, labelSelection, appliedLabels, isSaving, mode } = useAppSelector(
    (s) => s.newProduct,
  );
  const isEdit = mode === "edit";
  const afterSave = useAfterSave();
  const applied = appliedLabels.map((a) => a.labelId).sort();
  const isDirty = JSON.stringify([...labelSelection].sort()) !== JSON.stringify(applied);

  useEffect(() => {
    dispatch(startEditingLabels());
    dispatch(fetchFilterCatalog());
  }, [dispatch]);

  const groups = filterCatalog.filters
    .map((filter) => ({
      filter,
      labels: filterCatalog.labels.filter((label) => label.filter === filter.id),
    }))
    .filter((group) => group.labels.length > 0);

  const onSave = async () => {
    const result = await dispatch(saveLabelSelection());
    if (!saveLabelSelection.fulfilled.match(result)) return;
    if (isEdit) afterSave();
    else router.back();
  };

  return (
    <NewProductLayout
      step={4}
      stepLabel="Publicación"
      editTitle="Filtros y etiquetas"
      footer={
        !isEdit || isDirty ? (
          <ThemedButton
            title={isEdit ? "Guardar esta sección" : "Guardar filtros"}
            loading={isSaving}
            loadingTitle="Guardando…"
            onPress={onSave}
          />
        ) : undefined
      }
    >
      <ThemedText variant="title">Filtros y etiquetas</ThemedText>

      {groups.length === 0 && !isSaving && (
        <InfoBanner message="Todavía no hay filtros en tu negocio. Crea el primero." />
      )}

      {groups.map(({ filter, labels }) => (
        <View key={filter.id} style={styles.card}>
          <ThemedText variant="subtitle">{filter.name}</ThemedText>
          <View style={styles.chips}>
            {labels.map((label) => (
              <FilterChip
                key={label.id}
                label={label.name}
                selected={labelSelection.includes(label.id)}
                showCheck
                onPress={() => dispatch(toggleLabel(label.id))}
              />
            ))}
          </View>
        </View>
      ))}

      <ThemedButton
        title="Crear filtro / etiqueta"
        variant="outline"
        icon={Plus}
        onPress={() => router.push("/new-product/create-label")}
      />
      <ThemedText variant="caption" color={Colors.textSecondary}>
        Puedes seleccionar varias etiquetas por filtro.
      </ThemedText>
    </NewProductLayout>
  );
};

export default LabelsScreen;

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: radius.md,
    shadowColor: "#291140",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
