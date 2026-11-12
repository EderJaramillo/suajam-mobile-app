import { Colors, radius, spacing } from "@/config/theme/theme";
import {
  checkBarcodeInUse,
  isOfferValid,
  saveSimpleProduct,
  updateDraft,
} from "@/features/products/newProductSlice";
import InfoBanner from "@/presentation/theme/components/InfoBanner";
import BarcodeField from "@/presentation/theme/components/new-product/BarcodeField";
import NewProductLayout from "@/presentation/theme/components/new-product/NewProductLayout";
import OfferSheet, { OfferRow } from "@/presentation/theme/components/new-product/OfferSheet";
import PricePreview from "@/presentation/theme/components/new-product/PricePreview";
import ThemedButton from "@/presentation/theme/components/ThemedButton";
import ThemedCheckbox from "@/presentation/theme/components/ThemedCheckbox";
import ThemedText from "@/presentation/theme/components/ThemedText";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useState } from "react";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

// Fase 3 / 15 con oferta (30) y código duplicado (31). "Continuar" guarda precio, canales
// y fotos y pasa al paso 4 (publicación).
const SimpleChannelsScreen = () => {
  const dispatch = useAppDispatch();
  const { name, price, barcode, showOnStore, showOnPos, simpleOffer, isSaving, ivaRate, iepsRate } =
    useAppSelector((s) => s.newProduct);
  // Si ya se definieron impuestos (paso 4) y se vuelve aquí, la vista previa los incluye.
  const taxes = { iva: Number(ivaRate), ieps: Number(iepsRate) };
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [barcodeInUse, setBarcodeInUse] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const onContinue = async () => {
    setIsChecking(true);
    const check = await dispatch(checkBarcodeInUse({ barcode, variantKey: null }));
    setIsChecking(false);
    if (!checkBarcodeInUse.fulfilled.match(check)) return;
    if (check.payload) {
      setBarcodeInUse(true);
      return;
    }

    const result = await dispatch(saveSimpleProduct());
    if (saveSimpleProduct.fulfilled.match(result)) router.push("/new-product/publish");
  };

  return (
    <NewProductLayout
      step={3}
      footer={
        <ThemedButton
          title="Continuar"
          loading={isSaving || isChecking}
          loadingTitle={isChecking ? "Revisando…" : "Guardando…"}
          disabled={!isOfferValid(simpleOffer)}
          onPress={onContinue}
        />
      }
    >
      <ThemedText variant="title">{name}</ThemedText>

      <BarcodeField
        target="simple"
        value={barcode}
        onChange={(text) => {
          setBarcodeInUse(false);
          dispatch(updateDraft({ barcode: text }));
        }}
        error={barcodeInUse ? "Este código de barras ya está en uso en otro producto" : null}
      />

      <OfferRow offer={simpleOffer} onPress={() => setIsOfferOpen(true)} />

      <View style={styles.card}>
        <ThemedText variant="subtitle">Dónde mostrar</ThemedText>
        <ThemedCheckbox
          label="Tienda en línea / Catálogo"
          checked={showOnStore}
          onChange={(checked) => dispatch(updateDraft({ showOnStore: checked }))}
        />
        <ThemedCheckbox
          label="Punto de venta"
          checked={showOnPos}
          onChange={(checked) => dispatch(updateDraft({ showOnPos: checked }))}
        />
      </View>

      <PricePreview price={Number(price)} offer={simpleOffer} taxes={taxes} />

      {!isOfferValid(simpleOffer) ? (
        <InfoBanner tone="error" message="Para una oferta, elige al menos un canal." />
      ) : (
        <InfoBanner message="Para una oferta, elige al menos un canal. Los impuestos se definen en el siguiente paso." />
      )}

      <OfferSheet
        visible={isOfferOpen}
        price={Number(price)}
        offer={simpleOffer}
        onSave={(offer) => dispatch(updateDraft({ simpleOffer: offer }))}
        onClose={() => setIsOfferOpen(false)}
      />
    </NewProductLayout>
  );
};

export default SimpleChannelsScreen;

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
});
