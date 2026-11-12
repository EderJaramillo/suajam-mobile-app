import { Colors, iconStroke, radius, spacing } from "@/config/theme/theme";
import {
  MAX_PHOTOS,
  emptyModel,
  emptyVariant,
  hasPrice,
  saveModel,
  type DraftModel,
  type DraftPhoto,
} from "@/features/products/newProductSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Camera, ChevronRight, Circle, CircleDot, Copy } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import InfoBanner from "../InfoBanner";
import ThemedButton from "../ThemedButton";
import ThemedCheckbox from "../ThemedCheckbox";
import ThemedText from "../ThemedText";
import ThemedTextInput from "../ThemedTextInput";
import BottomSheet from "./BottomSheet";
import PhotoSourceContent from "./PhotoSourceContent";
import PricePreview from "./PricePreview";
import PriceFields from "./PriceFields";
import SheetCard from "./SheetCard";

type Mode = "form" | "photos" | "copy";

interface Props {
  visible: boolean;
  // "Con modelos" pide precio aquí; en "Modelos con variantes" el precio va en cada variante.
  withPrice: boolean;
  onClose: () => void;
}

// Fase 3 / 21 (agregar modelo), 22 (copiar precio) y 27 (modelo con variantes copiadas).
const AddModelSheet = ({ visible, withPrice, onClose }: Props) => {
  const dispatch = useAppDispatch();
  const { models, isSaving, error } = useAppSelector((s) => s.newProduct);

  const [mode, setMode] = useState<Mode>("form");
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [price, setPrice] = useState("");
  const [photos, setPhotos] = useState<DraftPhoto[]>([]);
  const [copyFromKey, setCopyFromKey] = useState<string | null>(null);
  const [copyVariants, setCopyVariants] = useState(true);

  const priced = models.filter((m) => m.variants.some(hasPrice));
  const copySource = priced.find((m) => m.key === copyFromKey)?.variants.find(hasPrice);
  // Fase 3 / 27: el modelo principal sirve de plantilla de variantes.
  const template = withPrice ? undefined : models.find((m) => m.variants.length > 0);

  const onShow = () => {
    setMode("form");
    setName("");
    setCost("");
    setPrice("");
    setPhotos([]);
    setCopyFromKey(null);
    setCopyVariants(true);
  };

  const onCreate = async () => {
    const model: DraftModel = { ...emptyModel(name.trim()), photos };
    if (withPrice) {
      const variant = emptyVariant(name.trim(), cost, price);
      model.variants = [variant];
      model.isActive = hasPrice(variant);
    } else if (template && copyVariants) {
      // Se copian nombres y precios; los códigos de barras y las fotos son propios de cada modelo.
      model.variants = template.variants.map((v) => ({
        ...emptyVariant(v.name, v.cost, v.price),
        isActive: v.isActive,
        offer: v.offer,
      }));
      model.isActive = model.variants.some(hasPrice);
    }
    const result = await dispatch(saveModel(model));
    if (saveModel.fulfilled.match(result)) onClose();
  };

  let content;
  if (mode === "photos") {
    content = (
      <PhotoSourceContent
        modelName={name.trim()}
        remaining={MAX_PHOTOS - photos.length}
        onAdd={(added) => setPhotos((current) => [...current, ...added].slice(0, MAX_PHOTOS))}
        onDone={() => setMode("form")}
      />
    );
  } else if (mode === "copy") {
    content = (
      <SheetCard title="Copiar precio">
        <ThemedText>Elige el modelo del que quieres copiar costo y precio.</ThemedText>
        {priced.map((model) => {
          const variant = model.variants.find(hasPrice)!;
          const isSelected = model.key === copyFromKey;
          const Icon = isSelected ? CircleDot : Circle;
          return (
            <Pressable
              key={model.key}
              onPress={() => setCopyFromKey(model.key)}
              style={styles.row}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              hitSlop={8}
            >
              <Icon
                size={24}
                color={isSelected ? Colors.primary : Colors.textSecondary}
                strokeWidth={iconStroke}
                absoluteStrokeWidth
              />
              <ThemedText variant="bodyMedium" style={styles.flex}>
                {model.name} · Venta ${variant.price} · Costo ${variant.cost}
              </ThemedText>
            </Pressable>
          );
        })}
        {copySource && <PricePreview price={Number(copySource.price)} />}
        <InfoBanner message="Solo se copian los precios. Las fotos siguen siendo propias de cada modelo." />
        <ThemedButton
          title={`Copiar a ${name.trim() || "este modelo"}`}
          disabled={!copySource}
          onPress={() => {
            if (!copySource) return;
            setCost(copySource.cost);
            setPrice(copySource.price);
            setMode("form");
          }}
        />
        <ThemedButton title="Volver" variant="text" onPress={() => setMode("form")} />
      </SheetCard>
    );
  } else {
    content = (
      <SheetCard title={name.trim() ? `Agregar modelo ${name.trim()}` : "Agregar modelo"}>
        <ThemedText variant="caption" color={Colors.primary}>
          1 Nombre → 2 Cámara{withPrice ? " → 3 Precio" : ""}
        </ThemedText>
        <ThemedTextInput
          label="Nombre del modelo *"
          placeholder="Ej. Rosa"
          value={name}
          onChangeText={setName}
          maxLength={100}
        />
        <Pressable
          onPress={() => setMode("photos")}
          style={styles.row}
          accessibilityRole="button"
        >
          <Camera size={24} color={Colors.primary} strokeWidth={iconStroke} absoluteStrokeWidth />
          <View style={styles.flex}>
            <ThemedText variant="bodyMedium">Agregar fotos</ThemedText>
            <ThemedText variant="caption" color={Colors.textSecondary}>
              {photos.length > 0
                ? `${photos.length}/${MAX_PHOTOS} fotos agregadas`
                : `Hasta ${MAX_PHOTOS} fotos de este modelo`}
            </ThemedText>
          </View>
          <ChevronRight
            size={24}
            color={Colors.textSecondary}
            strokeWidth={iconStroke}
            absoluteStrokeWidth
          />
        </Pressable>

        {withPrice && (
          <>
            <PriceFields
              cost={cost}
              price={price}
              showPreview={false}
              onChange={(changes) => {
                if (changes.cost !== undefined) setCost(changes.cost);
                if (changes.price !== undefined) setPrice(changes.price);
              }}
            />
            {priced.length > 0 && (
              <ThemedButton
                title="Copiar precio de otro modelo"
                variant="text"
                icon={Copy}
                onPress={() => setMode("copy")}
              />
            )}
          </>
        )}

        {template && (
          <>
            <ThemedCheckbox
              label={`Usar las mismas variantes y precios que ${template.name}`}
              checked={copyVariants}
              onChange={setCopyVariants}
            />
            {copyVariants && (
              <View style={styles.copyCard}>
                {template.variants.map((v) => (
                  <ThemedText key={v.key}>
                    {v.name} · {hasPrice(v) ? `$${v.price} · Costo $${v.cost}` : "Sin precio"}
                  </ThemedText>
                ))}
              </View>
            )}
            <InfoBanner
              message={`Las fotos no se copian. Agrega fotos propias del modelo ${name.trim() || "nuevo"}.`}
            />
          </>
        )}

        {!template && (
          <InfoBanner message="Puedes crear el modelo ahora y completar sus fotos después." />
        )}
        {error && <InfoBanner tone="error" message={error} />}
        <ThemedButton
          title={template && copyVariants ? "Crear modelo con variantes" : "Crear modelo"}
          loading={isSaving}
          loadingTitle="Guardando…"
          disabled={!name.trim()}
          onPress={onCreate}
        />
      </SheetCard>
    );
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} onShow={onShow}>
      {content}
    </BottomSheet>
  );
};

export default AddModelSheet;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  copyCard: {
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: radius.md,
  },
});
