import { Colors, radius, spacing } from "@/config/theme/theme";
import type { DraftVariant } from "@/features/products/newProductSlice";
import { EyeOff } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import InfoBanner from "../InfoBanner";
import ThemedButton from "../ThemedButton";
import ThemedText from "../ThemedText";
import BottomSheet from "./BottomSheet";
import SheetCard from "./SheetCard";
import VisibleSwitch from "./VisibleSwitch";

interface Props {
  visible: boolean;
  modelName: string;
  variant: DraftVariant | null;
  // ¿Hay otro modelo visible? Si no, ocultar este también oculta el producto.
  isLastVisibleModel: boolean;
  onHideModel: () => void;
  onClose: () => void;
}

// Fase 3 / 29: la última variante visible no se puede ocultar; se oculta el modelo.
const LastVariantSheet = ({
  visible,
  modelName,
  variant,
  isLastVisibleModel,
  onHideModel,
  onClose,
}: Props) => {
  const [isDone, setIsDone] = useState(false);

  return (
    <BottomSheet visible={visible} onClose={onClose} onShow={() => setIsDone(false)}>
      <SheetCard title={`Modelo ${modelName}`}>
        {variant && (
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <ThemedText variant="bodyStrong">{variant.name}</ThemedText>
                <ThemedText variant="caption" color={Colors.textSecondary}>
                  Costo ${variant.cost} · Venta ${variant.price}
                </ThemedText>
              </View>
              <VisibleSwitch label={`Variante ${variant.name}`} value locked onChange={() => {}} />
            </View>
            <InfoBanner tone="warning" message="Es la única variante visible de este modelo." />
            <ThemedText>Para ocultarla, oculta el modelo en su lugar.</ThemedText>
            {!isDone && (
              <ThemedButton
                title="Ocultar modelo"
                variant="outline"
                icon={EyeOff}
                onPress={() => {
                  onHideModel();
                  setIsDone(true);
                }}
              />
            )}
          </View>
        )}

        {isLastVisibleModel && !isDone && (
          <InfoBanner message="Si ocultas el último modelo visible, también se ocultará el producto." />
        )}
        {isDone && (
          <InfoBanner
            tone="success"
            message={
              isLastVisibleModel
                ? "El producto se ocultó porque no tiene modelos visibles."
                : "El modelo quedó oculto. Guárdalo para aplicar el cambio."
            }
          />
        )}
        {isDone && <ThemedButton title="Entendido" onPress={onClose} />}
      </SheetCard>
    </BottomSheet>
  );
};

export default LastVariantSheet;

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: radius.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
    gap: spacing.xs,
  },
});
