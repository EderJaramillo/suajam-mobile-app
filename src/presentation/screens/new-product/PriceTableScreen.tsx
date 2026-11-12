import { Colors, fonts, radius, spacing } from "@/config/theme/theme";
import { hasPrice, saveAllModels, setVariantPrice } from "@/features/products/newProductSlice";
import AppBar from "@/presentation/theme/components/AppBar";
import InfoBanner from "@/presentation/theme/components/InfoBanner";
import PricePreview from "@/presentation/theme/components/new-product/PricePreview";
import ScreenLayout from "@/presentation/theme/components/ScreenLayout";
import ThemedButton from "@/presentation/theme/components/ThemedButton";
import ThemedText from "@/presentation/theme/components/ThemedText";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { router } from "expo-router";
import { X } from "lucide-react-native";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";

const COLUMN_WIDTH = 84;
const LABEL_WIDTH = 72;

// Fase 3 / 28: precios de todas las variantes. Filas = variantes, columnas = modelos.
const PriceTableScreen = () => {
  const dispatch = useAppDispatch();
  const { name, models, isSaving, error } = useAppSelector((s) => s.newProduct);

  // Las filas son los nombres de variante que existen en cualquier modelo (CH, M, G…).
  const rows = [...new Set(models.flatMap((m) => m.variants.map((v) => v.name)))];
  const costs = [...new Set(models.flatMap((m) => m.variants.filter(hasPrice).map((v) => v.cost)))];
  const prices = models.flatMap((m) => m.variants.filter(hasPrice).map((v) => Number(v.price)));

  const onDone = async () => {
    const result = await dispatch(saveAllModels());
    if (saveAllModels.fulfilled.match(result)) router.back();
  };

  return (
    <ScreenLayout
      compactTop
      header={
        <AppBar
          title="Tabla de precios"
          onBack={() => router.back()}
          onAction={() => router.back()}
          actionIcon={X}
          actionLabel="Cerrar"
        />
      }
      footer={<ThemedButton title="Listo" loading={isSaving} loadingTitle="Guardando…" onPress={onDone} />}
    >
      <ThemedText variant="title">{name}</ThemedText>
      {models.length > 2 && (
        <InfoBanner message="↔ Desliza horizontalmente para ver todos los modelos." />
      )}

      <View style={styles.card}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.row}>
              <ThemedText variant="label" style={styles.labelCell}>
                Variante
              </ThemedText>
              {models.map((model) => (
                <ThemedText key={model.key} variant="label" style={styles.cell} numberOfLines={1}>
                  {model.name}
                </ThemedText>
              ))}
            </View>
            {rows.map((rowName) => (
              <View key={rowName} style={[styles.row, styles.bodyRow]}>
                <ThemedText variant="bodyStrong" style={styles.labelCell} numberOfLines={1}>
                  {rowName}
                </ThemedText>
                {models.map((model) => {
                  const variant = model.variants.find((v) => v.name === rowName);
                  return variant ? (
                    <View key={model.key} style={styles.cell}>
                      <TextInput
                        style={styles.priceInput}
                        value={variant.price}
                        onChangeText={(text) =>
                          dispatch(
                            setVariantPrice({
                              modelKey: model.key,
                              variantKey: variant.key,
                              price: text.replace(/[^0-9.]/g, ""),
                            }),
                          )
                        }
                        keyboardType="decimal-pad"
                        placeholder="$"
                        placeholderTextColor={Colors.textSecondary}
                        accessibilityLabel={`Precio de ${rowName} en ${model.name}`}
                      />
                    </View>
                  ) : (
                    <ThemedText
                      key={model.key}
                      variant="caption"
                      color={Colors.textSecondary}
                      style={styles.cell}
                    >
                      —
                    </ThemedText>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <ThemedText variant="caption" color={Colors.textSecondary}>
        {costs.length === 1 ? `Costo de cada variante: $${costs[0]}. ` : ""}Toca un precio para
        ajustarlo.
      </ThemedText>

      {prices.length > 0 && <PricePreview price={Math.min(...prices)} />}
      {error && <InfoBanner tone="error" message={error} />}
    </ScreenLayout>
  );
};

export default PriceTableScreen;

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: radius.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  bodyRow: {
    minHeight: 56,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  labelCell: {
    width: LABEL_WIDTH,
    paddingVertical: spacing.sm,
  },
  cell: {
    width: COLUMN_WIDTH,
    paddingHorizontal: spacing.xs,
  },
  priceInput: {
    height: 40,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm - 4,
    backgroundColor: Colors.background,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: Colors.textPrimary,
  },
});
