import { Colors, fonts, iconStroke, radius, spacing } from "@/config/theme/theme";
import { saveGeneralInfo, updateDraft } from "@/features/products/newProductSlice";
import InfoBanner from "@/presentation/theme/components/InfoBanner";
import CategorySheet from "@/presentation/theme/components/new-product/CategorySheet";
import DescriptionField from "@/presentation/theme/components/new-product/DescriptionField";
import NewProductLayout from "@/presentation/theme/components/new-product/NewProductLayout";
import ThemedButton from "@/presentation/theme/components/ThemedButton";
import ThemedText from "@/presentation/theme/components/ThemedText";
import ThemedTextInput from "@/presentation/theme/components/ThemedTextInput";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { ChevronDown } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAfterSave, useSnapshot } from "./useSectionSaved";

const MAX_NAME_LENGTH = 100;

// Fase 4 / 05: nombre, SKU, categoría y descripción.
const GeneralSectionScreen = () => {
  const dispatch = useAppDispatch();
  const afterSave = useAfterSave();
  const { name, sku, category, description, isSaving } = useAppSelector((s) => s.newProduct);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const { isDirty } = useSnapshot({ name, sku, category: category?.id ?? null, description });

  const isValid = name.trim().length > 0 && !!category && description.trim().length > 0;

  const onSave = async () => {
    const result = await dispatch(saveGeneralInfo({ name, sku, description, category }));
    if (saveGeneralInfo.fulfilled.match(result)) afterSave();
  };

  return (
    <NewProductLayout
      step={4}
      editTitle="Información general"
      footer={
        isDirty ? (
          <ThemedButton
            title="Guardar esta sección"
            loading={isSaving}
            loadingTitle="Guardando…"
            disabled={!isValid}
            onPress={onSave}
          />
        ) : undefined
      }
    >
      {isDirty && <InfoBanner message="Tienes cambios sin guardar en esta sección." />}

      <ThemedTextInput
        label="Nombre del producto *"
        value={name}
        onChangeText={(text) => dispatch(updateDraft({ name: text }))}
        helperRight={`${name.length}/${MAX_NAME_LENGTH}`}
        maxLength={MAX_NAME_LENGTH}
        error={name.trim() ? null : "Escribe el nombre del producto"}
      />

      <ThemedTextInput
        label="SKU (opcional)"
        placeholder="Ej. PLY-001"
        value={sku}
        onChangeText={(text) => dispatch(updateDraft({ sku: text }))}
        autoCapitalize="characters"
      />

      <View style={styles.field}>
        <ThemedText variant="label">Categoría *</ThemedText>
        <Pressable
          onPress={() => setIsCategoryOpen(true)}
          style={styles.select}
          accessibilityRole="button"
          accessibilityLabel="Categoría"
        >
          <Text style={[styles.selectText, category && styles.selectValue]} numberOfLines={1}>
            {category?.name ?? "Elige una categoría"}
          </Text>
          <ChevronDown size={16} color={Colors.textSecondary} strokeWidth={iconStroke} absoluteStrokeWidth />
        </Pressable>
      </View>

      <DescriptionField
        value={description}
        onChange={(text) => dispatch(updateDraft({ description: text }))}
        error={description.trim() ? null : "Agrega una descripción"}
      />

      <InfoBanner message="Los cambios de esta sección no modifican tus fotos ni precios." />

      <CategorySheet visible={isCategoryOpen} onClose={() => setIsCategoryOpen(false)} />
    </NewProductLayout>
  );
};

export default GeneralSectionScreen;

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs,
  },
  select: {
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
  selectText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: Colors.textSecondary,
  },
  selectValue: {
    color: Colors.textPrimary,
  },
});
