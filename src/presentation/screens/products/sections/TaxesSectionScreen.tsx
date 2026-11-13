import { Colors, radius, spacing } from "@/config/theme/theme";
import {
  IEPS_OPTIONS,
  IVA_OPTIONS,
  hasOffer,
  referencePrice,
  saveTaxesAndChannels,
} from "@/features/products/newProductSlice";
import NewProductLayout from "@/presentation/theme/components/new-product/NewProductLayout";
import PricePreview, { withTaxes } from "@/presentation/theme/components/new-product/PricePreview";
import FilterChip from "@/presentation/theme/components/products/FilterChip";
import ThemedButton from "@/presentation/theme/components/ThemedButton";
import ThemedText from "@/presentation/theme/components/ThemedText";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useAfterSave } from "./useSectionSaved";

const rateLabel = (rate: string) => (Number(rate) === 0 ? "No aplica" : `${rate}%`);
const amount = (n: number) => `$${n.toFixed(2)}`;

export function offerSummary(offer: { discount: string; onStore: boolean; onPos: boolean }) {
  if (!hasOffer(offer)) return "Sin oferta.";
  const d = Number(offer.discount);
  if (offer.onStore && offer.onPos) return `${d}% en Tienda en línea / Catálogo y en Punto de venta.`;
  if (offer.onStore) return `${d}% en Tienda en línea / Catálogo. Sin oferta en Punto de venta.`;
  return `${d}% en Punto de venta. Sin oferta en Tienda en línea / Catálogo.`;
}

// Fase 4 / 07: IVA e IEPS con el desglose "Así se calcula".
const TaxesSectionScreen = () => {
  const dispatch = useAppDispatch();
  const afterSave = useAfterSave();
  const draft = useAppSelector((s) => s.newProduct);
  const [ivaRate, setIvaRate] = useState(draft.ivaRate);
  const [iepsRate, setIepsRate] = useState(draft.iepsRate);

  const isDirty = Number(ivaRate) !== Number(draft.ivaRate) || Number(iepsRate) !== Number(draft.iepsRate);
  const { price, offer } = referencePrice(draft);
  const taxes = { iva: Number(ivaRate), ieps: Number(iepsRate) };
  const { ieps, iva, total } = withTaxes(price, taxes);

  const onSave = async () => {
    const result = await dispatch(
      saveTaxesAndChannels({
        ivaRate,
        iepsRate,
        showOnStore: draft.showOnStore,
        showOnPos: draft.showOnPos,
      }),
    );
    if (saveTaxesAndChannels.fulfilled.match(result)) afterSave();
  };

  const group = (title: string, options: string[], value: string, onChange: (rate: string) => void) => (
    <View style={styles.group}>
      <ThemedText variant="subtitle">{title}</ThemedText>
      <View style={styles.chips}>
        {options.map((rate) => (
          <FilterChip
            key={rate}
            label={rateLabel(rate)}
            selected={Number(value) === Number(rate)}
            onPress={() => onChange(rate)}
          />
        ))}
      </View>
    </View>
  );

  return (
    <NewProductLayout
      step={4}
      editTitle="Impuestos del producto"
      footer={
        isDirty ? (
          <ThemedButton
            title="Guardar esta sección"
            loading={draft.isSaving}
            loadingTitle="Guardando…"
            onPress={onSave}
          />
        ) : undefined
      }
    >
      <ThemedText variant="title">{draft.name}</ThemedText>

      <View style={styles.card}>
        {group("IVA", IVA_OPTIONS, ivaRate, setIvaRate)}
        {group("IEPS", IEPS_OPTIONS, iepsRate, setIepsRate)}
      </View>

      <View style={[styles.card, styles.calc]}>
        <ThemedText variant="subtitle">Así se calcula</ThemedText>
        <ThemedText variant="caption">Precio base: {amount(price)}</ThemedText>
        <ThemedText variant="caption">
          {taxes.ieps > 0 ? `IEPS ${taxes.ieps}%: ${amount(ieps)}` : "IEPS: No aplica"}
        </ThemedText>
        <ThemedText variant="caption">
          {taxes.iva > 0
            ? `IVA ${taxes.iva}% sobre ${amount(price + ieps)}: ${amount(iva)}`
            : "IVA: No aplica"}
        </ThemedText>
        <ThemedText variant="caption">Total antes de oferta: {amount(total)}</ThemedText>
      </View>

      <PricePreview price={price} offer={offer} taxes={taxes} />
      <ThemedText variant="caption" color={Colors.textSecondary}>
        {hasOffer(offer)
          ? `Oferta de ${Number(offer.discount)}% ${
              offer.onStore && offer.onPos
                ? "en ambos canales"
                : offer.onStore
                  ? "solo en tienda"
                  : "solo en punto de venta"
            }.`
          : "Sin oferta."}
      </ThemedText>
    </NewProductLayout>
  );
};

export default TaxesSectionScreen;

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
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
  calc: {
    gap: spacing.xs,
  },
  group: {
    gap: spacing.sm,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
