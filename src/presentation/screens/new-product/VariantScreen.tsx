import { Colors } from "@/config/theme/theme";
import {
  checkBarcodeInUse,
  commitEditingVariant,
  hasPrice,
  isOfferValid,
  updateEditingVariant,
} from "@/features/products/newProductSlice";
import AppBar from "@/presentation/theme/components/AppBar";
import InfoBanner from "@/presentation/theme/components/InfoBanner";
import BarcodeField from "@/presentation/theme/components/new-product/BarcodeField";
import OfferSheet, { OfferRow } from "@/presentation/theme/components/new-product/OfferSheet";
import PriceFields from "@/presentation/theme/components/new-product/PriceFields";
import PricePreview from "@/presentation/theme/components/new-product/PricePreview";
import SheetCard from "@/presentation/theme/components/new-product/SheetCard";
import ScreenLayout from "@/presentation/theme/components/ScreenLayout";
import ThemedButton from "@/presentation/theme/components/ThemedButton";
import ThemedText from "@/presentation/theme/components/ThemedText";
import ThemedTextInput from "@/presentation/theme/components/ThemedTextInput";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { router } from "expo-router";
import { X } from "lucide-react-native";
import { useState } from "react";

// Fase 3 / 25 (precio de la variante), 31 (código duplicado) y 32 (nombre requerido).
// Edita la variante abierta con startEditingVariant; "Guardar" la deja en el modelo.
const VariantScreen = () => {
  const dispatch = useAppDispatch();
  const { editingVariant: variant, error } = useAppSelector((s) => s.newProduct);
  const [submitted, setSubmitted] = useState(false);
  const [barcodeInUse, setBarcodeInUse] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);

  if (!variant) return null;

  const nameError = submitted && !variant.name.trim() ? "Ingresa el nombre de la variante" : null;
  const priceMissing = submitted && !hasPrice(variant);

  const update = (changes: Parameters<typeof updateEditingVariant>[0]) => {
    if (changes.barcode !== undefined) setBarcodeInUse(false);
    dispatch(updateEditingVariant(changes));
  };

  const onSave = async () => {
    setSubmitted(true);
    if (!variant.name.trim() || !hasPrice(variant) || !isOfferValid(variant.offer)) return;

    setIsChecking(true);
    const result = await dispatch(checkBarcodeInUse({ barcode: variant.barcode, variantKey: variant.key }));
    setIsChecking(false);
    if (!checkBarcodeInUse.fulfilled.match(result)) return;
    if (result.payload) {
      setBarcodeInUse(true);
      return;
    }
    dispatch(commitEditingVariant());
    router.back();
  };

  return (
    <ScreenLayout
      compactTop
      header={
        <AppBar
          title={variant.name.trim() ? `Variante ${variant.name.trim()}` : "Nueva variante"}
          onBack={() => router.back()}
          onAction={() => router.back()}
          actionIcon={X}
          actionLabel="Cerrar"
        />
      }
      footer={
        <ThemedButton
          title="Guardar variante"
          loading={isChecking}
          loadingTitle="Revisando…"
          onPress={onSave}
        />
      }
    >
      <SheetCard title="Precio de la variante">
        <ThemedTextInput
          label="Nombre de la variante *"
          placeholder="Ej. CH"
          value={variant.name}
          onChangeText={(name) => update({ name })}
          error={nameError}
          maxLength={100}
        />

        <PriceFields
          cost={variant.cost}
          price={variant.price}
          showPreview={false}
          onChange={(changes) => update(changes)}
        />
        {priceMissing && <InfoBanner tone="error" message="Agrega costo y precio de venta." />}

        <BarcodeField
          target="variant"
          value={variant.barcode}
          onChange={(barcode) => update({ barcode })}
          error={barcodeInUse ? "Este código de barras ya está en uso en otro producto" : null}
        />

        <OfferRow offer={variant.offer} onPress={() => setIsOfferOpen(true)} />

        {hasPrice(variant) && <PricePreview price={Number(variant.price)} offer={variant.offer} />}

        {error && <InfoBanner tone="error" message={error} />}
        <ThemedText variant="caption" color={Colors.textSecondary}>
          El código debe ser único dentro de tu negocio.
        </ThemedText>
      </SheetCard>

      <OfferSheet
        visible={isOfferOpen}
        price={Number(variant.price)}
        offer={variant.offer}
        onSave={(offer) => update({ offer })}
        onClose={() => setIsOfferOpen(false)}
      />
    </ScreenLayout>
  );
};

export default VariantScreen;
