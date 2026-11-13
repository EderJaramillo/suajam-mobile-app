import { Colors, radius, spacing } from "@/config/theme/theme";
import { referencePrice, saveTaxesAndChannels } from "@/features/products/newProductSlice";
import InfoBanner from "@/presentation/theme/components/InfoBanner";
import NewProductLayout from "@/presentation/theme/components/new-product/NewProductLayout";
import PricePreview from "@/presentation/theme/components/new-product/PricePreview";
import ThemedButton from "@/presentation/theme/components/ThemedButton";
import ThemedCheckbox from "@/presentation/theme/components/ThemedCheckbox";
import ThemedText from "@/presentation/theme/components/ThemedText";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { offerSummary } from "./TaxesSectionScreen";
import { useAfterSave } from "./useSectionSaved";

// Fase 4 / 08: tienda en línea y punto de venta son independientes.
const ChannelsSectionScreen = () => {
  const dispatch = useAppDispatch();
  const afterSave = useAfterSave();
  const draft = useAppSelector((s) => s.newProduct);
  const [showOnStore, setShowOnStore] = useState(draft.showOnStore);
  const [showOnPos, setShowOnPos] = useState(draft.showOnPos);

  const isDirty = showOnStore !== draft.showOnStore || showOnPos !== draft.showOnPos;
  const { price, offer } = referencePrice(draft);

  const onSave = async () => {
    const result = await dispatch(
      saveTaxesAndChannels({ ivaRate: draft.ivaRate, iepsRate: draft.iepsRate, showOnStore, showOnPos }),
    );
    if (saveTaxesAndChannels.fulfilled.match(result)) afterSave();
  };

  return (
    <NewProductLayout
      step={4}
      editTitle="Canales"
      footer={
        isDirty ? (
          <ThemedButton
            title="Guardar esta sección"
            loading={draft.isSaving}
            loadingTitle="Guardando…"
            disabled={!showOnStore && !showOnPos}
            onPress={onSave}
          />
        ) : undefined
      }
    >
      <ThemedText variant="title">Dónde mostrar tu producto</ThemedText>

      <View style={styles.card}>
        <ThemedCheckbox label="Tienda en línea / Catálogo" checked={showOnStore} onChange={setShowOnStore} />
        <ThemedCheckbox label="Punto de venta" checked={showOnPos} onChange={setShowOnPos} />
      </View>

      {!showOnStore && !showOnPos ? (
        <InfoBanner tone="error" message="Elige al menos un canal para mostrar el producto." />
      ) : (
        <InfoBanner message="Cada canal es independiente. Puedes vender en uno o en ambos." />
      )}

      <View style={[styles.card, styles.offer]}>
        <ThemedText variant="subtitle">Oferta del producto</ThemedText>
        <ThemedText color={Colors.textSecondary}>{offerSummary(offer)}</ThemedText>
      </View>

      <PricePreview
        price={price}
        offer={offer}
        taxes={{ iva: Number(draft.ivaRate), ieps: Number(draft.iepsRate) }}
      />
    </NewProductLayout>
  );
};

export default ChannelsSectionScreen;

const styles = StyleSheet.create({
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
  offer: {
    gap: spacing.sm,
  },
});
