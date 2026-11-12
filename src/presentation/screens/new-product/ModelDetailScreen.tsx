import { Colors, iconStroke, radius, spacing } from "@/config/theme/theme";
import {
  hasPrice,
  saveModel,
  startEditingVariant,
  updateEditingModel,
  type DraftVariant,
} from "@/features/products/newProductSlice";
import { VARIANTS_TYPE } from "@/features/products/productsTypes";
import LastVariantSheet from "@/presentation/theme/components/new-product/LastVariantSheet";
import NewProductLayout from "@/presentation/theme/components/new-product/NewProductLayout";
import PhotoSlots from "@/presentation/theme/components/new-product/PhotoSlots";
import PriceFields from "@/presentation/theme/components/new-product/PriceFields";
import QuickVariantsSheet from "@/presentation/theme/components/new-product/QuickVariantsSheet";
import VisibleSwitch from "@/presentation/theme/components/new-product/VisibleSwitch";
import ThemedButton from "@/presentation/theme/components/ThemedButton";
import ThemedText from "@/presentation/theme/components/ThemedText";
import ThemedTextInput from "@/presentation/theme/components/ThemedTextInput";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { router } from "expo-router";
import { ChevronRight, Image as ImageIcon, Plus } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

// Fase 3 / 20 (modelo con un precio) y 24 (modelo con variantes).
// Edita la copia `editingModel` del store (la abre startEditingModel); "Guardar modelo" la manda a la API.
const ModelDetailScreen = () => {
  const dispatch = useAppDispatch();
  const { editingModel: model, models, typeId, isSaving } = useAppSelector((s) => s.newProduct);
  const withVariants = typeId === VARIANTS_TYPE;

  const [isQuickOpen, setIsQuickOpen] = useState(false);
  const [lockedVariant, setLockedVariant] = useState<DraftVariant | null>(null);

  if (!model) return null;

  const isMain = models[0]?.key === model.key;
  const update = (changes: Parameters<typeof updateEditingModel>[0]) =>
    dispatch(updateEditingModel(changes));
  const canBeVisible = model.variants.some(hasPrice);
  const visibleVariants = model.variants.filter((v) => v.isActive && hasPrice(v));
  const otherVisibleModels = models.filter((m) => m.key !== model.key && m.isActive);
  const singleVariant = model.variants[0];

  const updateSingleVariant = (changes: Partial<DraftVariant>) => {
    if (!singleVariant) return;
    const variant = { ...singleVariant, ...changes };
    // Sin precio el modelo no puede quedar visible.
    update({ variants: [variant], isActive: hasPrice(variant) ? model.isActive : false });
  };

  const setVariantActive = (variant: DraftVariant, isActive: boolean) =>
    update({
      variants: model.variants.map((v) => (v.key === variant.key ? { ...v, isActive } : v)),
    });

  const openVariant = (key: string | null) => {
    dispatch(startEditingVariant(key));
    router.push("/new-product/variant");
  };

  const onSave = async () => {
    const toSave = {
      ...model,
      // En "Con modelos" la presentación se llama igual que el modelo.
      variants: withVariants ? model.variants : model.variants.map((v) => ({ ...v, name: model.name })),
    };
    const result = await dispatch(saveModel(toSave));
    if (saveModel.fulfilled.match(result)) router.back();
  };

  return (
    <NewProductLayout
      step={3}
      title={`Modelo ${model.name}`}
      footer={
        <ThemedButton
          title="Guardar modelo"
          loading={isSaving}
          loadingTitle="Guardando…"
          disabled={!model.name.trim()}
          onPress={onSave}
        />
      }
    >
      {withVariants && (
        <View style={styles.row}>
          <ThemedText variant="title" style={styles.flex}>
            {model.name}
          </ThemedText>
          {isMain && (
            <View style={styles.badge}>
              <ImageIcon size={14} color={Colors.primary} strokeWidth={iconStroke} absoluteStrokeWidth />
              <ThemedText variant="caption" color={Colors.primary}>
                Principal
              </ThemedText>
            </View>
          )}
          <VisibleSwitch
            label="Modelo visible"
            value={model.isActive}
            locked={!canBeVisible}
            onChange={(isActive) => update({ isActive })}
          />
        </View>
      )}

      <ThemedTextInput
        label="Nombre del modelo *"
        value={model.name}
        onChangeText={(name) => update({ name })}
        maxLength={100}
      />

      {!withVariants && (
        <View style={styles.row}>
          <View style={styles.flex}>
            <ThemedText variant="bodyMedium">Visible</ThemedText>
            {!canBeVisible && (
              <ThemedText variant="caption" color={Colors.textSecondary}>
                Agrega un precio para activar
              </ThemedText>
            )}
          </View>
          <VisibleSwitch
            label="Modelo visible"
            value={model.isActive}
            locked={!canBeVisible}
            onChange={(isActive) => update({ isActive })}
          />
        </View>
      )}

      <PhotoSlots photos={model.photos} modelName={model.name} onChange={(photos) => update({ photos })} />

      {!withVariants && singleVariant && (
        <PriceFields cost={singleVariant.cost} price={singleVariant.price} onChange={updateSingleVariant} />
      )}

      {withVariants && (
        <>
          {model.variants.length > 0 && (
            <View style={styles.card}>
              {model.variants.map((variant) => {
                // Fase 3 / 29: la última variante visible de un modelo visible queda bloqueada.
                const isLastVisible =
                  model.isActive && variant.isActive && visibleVariants.length === 1 && hasPrice(variant);
                return (
                  <View key={variant.key} style={styles.row}>
                    <Pressable
                      style={styles.variantText}
                      onPress={() => openVariant(variant.key)}
                      accessibilityRole="button"
                      accessibilityLabel={`Editar variante ${variant.name}`}
                    >
                      <ThemedText variant="bodyStrong">{variant.name}</ThemedText>
                      <ThemedText variant="caption" color={Colors.textSecondary}>
                        {hasPrice(variant) ? `Costo $${variant.cost} · Venta $${variant.price}` : "Falta precio"}
                      </ThemedText>
                    </Pressable>
                    <VisibleSwitch
                      label={`Variante ${variant.name} visible`}
                      value={variant.isActive}
                      locked={!hasPrice(variant) || isLastVisible}
                      onLockedPress={isLastVisible ? () => setLockedVariant(variant) : undefined}
                      onChange={(isActive) => setVariantActive(variant, isActive)}
                    />
                    <ChevronRight
                      size={20}
                      color={Colors.textSecondary}
                      strokeWidth={iconStroke}
                      absoluteStrokeWidth
                    />
                  </View>
                );
              })}
            </View>
          )}
          <ThemedButton
            title="Agregar variante"
            variant="outline"
            icon={Plus}
            onPress={() => setIsQuickOpen(true)}
          />
          <QuickVariantsSheet visible={isQuickOpen} onClose={() => setIsQuickOpen(false)} />
          <LastVariantSheet
            visible={lockedVariant !== null}
            modelName={model.name}
            variant={lockedVariant}
            isLastVisibleModel={otherVisibleModels.length === 0}
            onHideModel={() => update({ isActive: false })}
            onClose={() => setLockedVariant(null)}
          />
        </>
      )}
    </NewProductLayout>
  );
};

export default ModelDetailScreen;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  badge: {
    height: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm - 4,
    backgroundColor: Colors.selected,
  },
  card: {
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
  variantText: {
    flex: 1,
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
});
