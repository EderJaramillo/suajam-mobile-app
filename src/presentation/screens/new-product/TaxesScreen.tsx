import { Colors, radius, spacing } from "@/config/theme/theme";
import {
  IEPS_OPTIONS,
  IVA_OPTIONS,
  hasOffer,
  referencePrice,
  saveTaxesAndChannels,
  type Offer,
} from "@/features/products/newProductSlice";
import NewProductLayout from "@/presentation/theme/components/new-product/NewProductLayout";
import PricePreview, {
  money,
  withTaxes,
  type Taxes,
} from "@/presentation/theme/components/new-product/PricePreview";
import FilterChip from "@/presentation/theme/components/products/FilterChip";
import ThemedButton from "@/presentation/theme/components/ThemedButton";
import ThemedCheckbox from "@/presentation/theme/components/ThemedCheckbox";
import ThemedText from "@/presentation/theme/components/ThemedText";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

const rateLabel = (rate: string) => (Number(rate) === 0 ? "No aplica" : `${rate}%`);

// "Refresco: $25 + $2 IEPS = $27; IVA $4.32. Total $31.32. Oferta de 10% solo en tienda."
function breakdown(name: string, price: number, taxes: Taxes, offer: Offer) {
  const { ieps, iva, total } = withTaxes(price, taxes);
  let text = `${name}: ${money(price)}`;
  if (ieps > 0) text += ` + ${money(ieps)} IEPS = ${money(price + ieps)}`;
  text += iva > 0 ? `; IVA ${money(iva)}.` : ".";
  text += ` Total ${money(total)}.`;
  if (hasOffer(offer)) {
    const where =
      offer.onStore && offer.onPos
        ? "en ambos canales"
        : offer.onStore
          ? "solo en tienda"
          : "solo en punto de venta";
    text += ` Oferta de ${Number(offer.discount)}% ${where}.`;
  }
  return text;
}

// Fase 3 / 36: impuestos y dónde se muestra el producto.
const TaxesScreen = () => {
  const dispatch = useAppDispatch();
  const draft = useAppSelector((s) => s.newProduct);
  const [ivaRate, setIvaRate] = useState(draft.ivaRate);
  const [iepsRate, setIepsRate] = useState(draft.iepsRate);
  const [showOnStore, setShowOnStore] = useState(draft.showOnStore);
  const [showOnPos, setShowOnPos] = useState(draft.showOnPos);

  const { price, offer } = referencePrice(draft);
  const taxes = { iva: Number(ivaRate), ieps: Number(iepsRate) };
  const noChannel = !showOnStore && !showOnPos;

  const onSave = async () => {
    const result = await dispatch(
      saveTaxesAndChannels({ ivaRate, iepsRate, showOnStore, showOnPos }),
    );
    if (saveTaxesAndChannels.fulfilled.match(result)) router.back();
  };

  const rateGroup = (
    title: string,
    options: string[],
    value: string,
    onChange: (rate: string) => void,
  ) => (
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
      stepLabel="Publicación"
      footer={
        <ThemedButton
          title="Guardar y volver"
          loading={draft.isSaving}
          loadingTitle="Guardando…"
          disabled={noChannel}
          onPress={onSave}
        />
      }
    >
      <ThemedText variant="title">Impuestos y canales</ThemedText>
      {rateGroup("IVA", IVA_OPTIONS, ivaRate, setIvaRate)}
      {rateGroup("IEPS", IEPS_OPTIONS, iepsRate, setIepsRate)}

      <View style={styles.card}>
        <ThemedText variant="subtitle">Dónde mostrar</ThemedText>
        <ThemedCheckbox
          label="Tienda en línea / Catálogo"
          checked={showOnStore}
          onChange={setShowOnStore}
        />
        <ThemedCheckbox label="Punto de venta" checked={showOnPos} onChange={setShowOnPos} />
      </View>

      <PricePreview price={price} offer={offer} taxes={taxes} />
      <ThemedText variant="caption" color={noChannel ? Colors.danger : Colors.textSecondary}>
        {noChannel
          ? "Elige al menos un canal para mostrar el producto."
          : breakdown(draft.name.trim(), price, taxes, offer)}
      </ThemedText>
    </NewProductLayout>
  );
};

export default TaxesScreen;

const styles = StyleSheet.create({
  group: {
    gap: spacing.sm,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  card: {
    gap: spacing.xs,
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
});
