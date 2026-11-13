import {
  checkBarcodeInUse,
  hasPrice,
  saveSimpleProduct,
  setFirstModelPhotos,
  updateDraft,
} from "@/features/products/newProductSlice";
import InfoBanner from "@/presentation/theme/components/InfoBanner";
import BarcodeField from "@/presentation/theme/components/new-product/BarcodeField";
import NewProductLayout from "@/presentation/theme/components/new-product/NewProductLayout";
import PhotoSlots from "@/presentation/theme/components/new-product/PhotoSlots";
import PriceFields from "@/presentation/theme/components/new-product/PriceFields";
import PricePreview from "@/presentation/theme/components/new-product/PricePreview";
import ThemedButton from "@/presentation/theme/components/ThemedButton";
import ThemedText from "@/presentation/theme/components/ThemedText";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useState } from "react";
import { useAfterSave, useSnapshot } from "./useSectionSaved";

// Fase 4 / 06: fotos, costo, precio y código de barras del producto Simple.
const SimplePricingSectionScreen = () => {
  const dispatch = useAppDispatch();
  const afterSave = useAfterSave();
  const { name, cost, price, barcode, models, simpleOffer, ivaRate, iepsRate, isSaving } =
    useAppSelector((s) => s.newProduct);
  const photos = models[0]?.photos ?? [];
  const [barcodeInUse, setBarcodeInUse] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const { isDirty } = useSnapshot({ cost, price, barcode, photos: photos.map((p) => p.uri) });

  const onSave = async () => {
    setIsChecking(true);
    const check = await dispatch(checkBarcodeInUse({ barcode, variantKey: null }));
    setIsChecking(false);
    if (!checkBarcodeInUse.fulfilled.match(check)) return;
    if (check.payload) {
      setBarcodeInUse(true);
      return;
    }
    const result = await dispatch(saveSimpleProduct());
    if (saveSimpleProduct.fulfilled.match(result)) afterSave();
  };

  return (
    <NewProductLayout
      step={3}
      editTitle="Fotos y precio"
      footer={
        isDirty ? (
          <ThemedButton
            title="Guardar esta sección"
            loading={isSaving || isChecking}
            loadingTitle={isChecking ? "Revisando…" : "Guardando…"}
            disabled={!hasPrice({ cost, price }) || photos.length === 0}
            onPress={onSave}
          />
        ) : undefined
      }
    >
      <ThemedText variant="title">{name}</ThemedText>

      <PhotoSlots
        photos={photos}
        modelName={name}
        onChange={(next) => dispatch(setFirstModelPhotos(next))}
      />

      <PriceFields
        cost={cost}
        price={price}
        showPreview={false}
        onChange={(changes) => dispatch(updateDraft(changes))}
      />

      <BarcodeField
        target="simple"
        value={barcode}
        onChange={(text) => {
          setBarcodeInUse(false);
          dispatch(updateDraft({ barcode: text }));
        }}
        error={barcodeInUse ? "Este código de barras ya está en uso en otro producto" : null}
      />

      <PricePreview
        price={Number(price)}
        offer={simpleOffer}
        taxes={{ iva: Number(ivaRate), ieps: Number(iepsRate) }}
      />

      {isDirty && <InfoBanner message="Tienes cambios sin guardar. El tipo Simple no cambia." />}
    </NewProductLayout>
  );
};

export default SimplePricingSectionScreen;
