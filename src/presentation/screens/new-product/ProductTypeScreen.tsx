import { Colors, spacing } from "@/config/theme/theme";
import { confirmProductType } from "@/features/products/newProductSlice";
import { SIMPLE_TYPE, productTypes } from "@/features/products/productsTypes";
import ConfirmDialog from "@/presentation/theme/components/ConfirmDialog";
import InfoBanner from "@/presentation/theme/components/InfoBanner";
import NewProductLayout from "@/presentation/theme/components/new-product/NewProductLayout";
import ProductTypeCard from "@/presentation/theme/components/new-product/ProductTypeCard";
import ThemedButton from "@/presentation/theme/components/ThemedButton";
import ThemedText from "@/presentation/theme/components/ThemedText";
import ThemedTextInput from "@/presentation/theme/components/ThemedTextInput";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { router } from "expo-router";
import { Boxes, CircleHelp, Info, Network, Package, type LucideIcon } from "lucide-react-native";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

const details: Record<
  number,
  {
    icon: LucideIcon;
    description: string;
    diagram: string;
    notice: string;
    modelPlaceholder?: string;
  }
> = {
  1: {
    icon: Package,
    description: "Un solo artículo con un precio. Café en grano 1 kg.",
    diagram: "Artículo → $280",
    notice: "No necesitas capturar existencias para vender.",
  },
  2: {
    icon: Boxes,
    description: "Varias versiones, cada una con su foto y precio. Termo Negro / Rosa / Azul.",
    diagram: "Negro · Rosa · Azul → $349 c/u",
    notice: "Captura existencias iniciales al terminar.",
    modelPlaceholder: "Ej. Negro",
  },
  3: {
    icon: Network,
    description: "Varias versiones con opciones como talla o tamaño; cada opción con su precio.",
    diagram: "Roja → CH · M · G · XG → $199–$249",
    notice: "El stock se habilita con recepciones de compra.",
    modelPlaceholder: "Ej. Roja",
  },
};

// Fase 3 / 05 a 08, y la confirmación del tipo (10 a 12).
const ProductTypeScreen = () => {
  const dispatch = useAppDispatch();
  const isSaving = useAppSelector((s) => s.newProduct.isSaving);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [modelName, setModelName] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const selected = productTypes.find((t) => t.id === selectedId);
  const detail = selectedId ? details[selectedId] : null;
  const needsModelName = selectedId !== null && selectedId !== SIMPLE_TYPE;
  const canContinue = selectedId !== null && (!needsModelName || modelName.trim() !== "");

  const onConfirm = async () => {
    if (!selectedId) return;
    const result = await dispatch(confirmProductType({ typeId: selectedId, modelName }));
    setIsConfirmOpen(false);
    if (!confirmProductType.fulfilled.match(result)) return;

    router.replace(selectedId === SIMPLE_TYPE ? "/new-product/prices" : "/new-product/models");
  };

  return (
    <NewProductLayout
      step={2}
      footer={
        <ThemedButton
          title="Continuar"
          disabled={!canContinue}
          onPress={() => setIsConfirmOpen(true)}
        />
      }
    >
      <ThemedText variant="title">¿Cómo vendes este producto?</ThemedText>

      <View style={styles.types}>
        {productTypes.map(({ id, label }) => (
          <ProductTypeCard
            key={id}
            title={label}
            description={details[id].description}
            diagram={details[id].diagram}
            icon={details[id].icon}
            selected={id === selectedId}
            collapsed={selectedId !== null && id !== selectedId}
            onPress={() => setSelectedId(id)}
          />
        ))}
      </View>

      {needsModelName && (
        <ThemedTextInput
          label="Nombre del primer modelo *"
          placeholder={detail?.modelPlaceholder}
          value={modelName}
          onChangeText={setModelName}
          maxLength={100}
        />
      )}

      {detail && <InfoBanner message={detail.notice} />}

      <ThemedText variant="caption" color={Colors.textSecondary}>
        El tipo no se podrá cambiar después.
      </ThemedText>

      <ThemedButton
        title="¿No sabes cuál elegir?"
        variant="text"
        icon={CircleHelp}
        onPress={() => Alert.alert("Próximamente", "Esta ayuda estará disponible pronto.")}
      />

      <ConfirmDialog
        visible={isConfirmOpen}
        icon={Info}
        title={`¿Confirmas que es un producto ${selected?.label}?`}
        description="No podrás cambiarlo después. Las fotos y precios se organizarán según este tipo."
        confirmLabel="Confirmar tipo"
        confirmVariant="primary"
        loading={isSaving}
        onConfirm={onConfirm}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </NewProductLayout>
  );
};

export default ProductTypeScreen;

const styles = StyleSheet.create({
  types: {
    gap: spacing.sm,
  },
});
