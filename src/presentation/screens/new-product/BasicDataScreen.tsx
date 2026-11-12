import { Colors, fonts, iconStroke, radius, spacing } from "@/config/theme/theme";
import { saveBasicData, updateDraft } from "@/features/products/newProductSlice";
import InfoBanner from "@/presentation/theme/components/InfoBanner";
import CategorySheet from "@/presentation/theme/components/new-product/CategorySheet";
import NewProductLayout from "@/presentation/theme/components/new-product/NewProductLayout";
import ThemedButton from "@/presentation/theme/components/ThemedButton";
import ThemedText from "@/presentation/theme/components/ThemedText";
import ThemedTextInput from "@/presentation/theme/components/ThemedTextInput";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { router } from "expo-router";
import { ChevronDown } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const MAX_NAME_LENGTH = 100;

// Fase 3 / 01 y 02.
const BasicDataScreen = () => {
  const dispatch = useAppDispatch();
  const { name, category, isSaving } = useAppSelector((s) => s.newProduct);
  const [submitted, setSubmitted] = useState(false);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);

  const nameError = submitted && !name.trim() ? "Campo requerido" : null;
  const categoryError = submitted && !category ? "Selecciona una categoría" : null;

  const onContinue = async () => {
    setSubmitted(true);
    if (!name.trim() || !category) return;
    const result = await dispatch(saveBasicData());
    if (saveBasicData.fulfilled.match(result)) router.push("/new-product/type");
  };

  return (
    <NewProductLayout
      step={1}
      footer={
        <ThemedButton
          title="Continuar"
          loading={isSaving}
          loadingTitle="Guardando…"
          onPress={onContinue}
        />
      }
    >
      <CategorySheet
        visible={isCategorySheetOpen}
        onClose={() => setIsCategorySheetOpen(false)}
      />

      <View style={styles.intro}>
        <ThemedText variant="display">Empecemos por lo básico</ThemedText>
        <ThemedText color={Colors.textSecondary}>
          Ponle un nombre que tus clientes reconozcan.
        </ThemedText>
      </View>

      <ThemedTextInput
        label="Nombre del producto *"
        placeholder="Ej. Playera básica"
        value={name}
        onChangeText={(text) => dispatch(updateDraft({ name: text }))}
        error={nameError}
        helperRight={`${name.length}/${MAX_NAME_LENGTH}`}
        maxLength={MAX_NAME_LENGTH}
      />

      <View style={styles.field}>
        <ThemedText variant="label">Categoría *</ThemedText>
        <Pressable
          onPress={() => setIsCategorySheetOpen(true)}
          style={[styles.select, categoryError && styles.selectError]}
          accessibilityRole="button"
          accessibilityLabel="Categoría"
        >
          <Text style={[styles.selectText, category && styles.selectValue]} numberOfLines={1}>
            {category?.name ?? "Elige una categoría"}
          </Text>
          <ChevronDown
            size={16}
            color={Colors.textSecondary}
            strokeWidth={iconStroke}
            absoluteStrokeWidth
          />
        </Pressable>
        {categoryError && (
          <ThemedText variant="caption" color={Colors.danger}>
            {categoryError}
          </ThemedText>
        )}
      </View>

      <InfoBanner message="Al continuar guardaremos un borrador. Puedes terminarlo después." />

      <View style={styles.card}>
        <ThemedText variant="subtitle">Todo empieza con un producto</ThemedText>
        <ThemedText color={Colors.textSecondary}>
          Después elegirás cómo lo vendes, sus fotos y sus precios.
        </ThemedText>
      </View>
    </NewProductLayout>
  );
};

export default BasicDataScreen;

const styles = StyleSheet.create({
  intro: {
    gap: spacing.sm,
  },
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
  selectError: {
    borderColor: Colors.danger,
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
  card: {
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: radius.md,
  },
});
