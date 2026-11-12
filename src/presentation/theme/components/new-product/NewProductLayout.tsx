import { Colors, spacing } from "@/config/theme/theme";
import { resetDraft } from "@/features/products/newProductSlice";
import { fetchProducts } from "@/features/products/productsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { router } from "expo-router";
import { Info, X } from "lucide-react-native";
import { useState, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import AppBar from "../AppBar";
import ConfirmDialog from "../ConfirmDialog";
import InfoBanner from "../InfoBanner";
import ScreenLayout from "../ScreenLayout";
import ThemedText from "../ThemedText";

const steps = ["Datos básicos", "Tipo de producto", "Fotos y precios", "Descripción y publicación"];

interface Props {
  step: 1 | 2 | 3 | 4;
  children: ReactNode;
  footer?: ReactNode;
  // Cuando el tipo ya es definitivo, volver equivale a salir.
  backExits?: boolean;
  title?: string;
  // Texto del paso cuando la pantalla no usa el nombre normal ("Publicación").
  stepLabel?: string;
}

export function useLeaveNewProduct() {
  const dispatch = useAppDispatch();
  return () => {
    dispatch(resetDraft());
    dispatch(fetchProducts("refresh"));
    router.dismissTo("/products");
  };
}

const NewProductLayout = ({
  step,
  children,
  footer,
  backExits = false,
  title = "Agregar producto",
  stepLabel,
}: Props) => {
  const productId = useAppSelector((s) => s.newProduct.productId);
  const error = useAppSelector((s) => s.newProduct.error);
  const leave = useLeaveNewProduct();
  const [isExitOpen, setIsExitOpen] = useState(false);

  // Antes del paso 1 no hay borrador que guardar.
  const onExit = () => (productId ? setIsExitOpen(true) : leave());

  return (
    <ScreenLayout
      compactTop
      header={
        <AppBar
          title={title}
          onBack={backExits ? onExit : () => router.back()}
          onAction={onExit}
          actionIcon={X}
          actionLabel="Salir"
        />
      }
      footer={footer}
    >
      <View style={styles.progress}>
        <View style={styles.segments}>
          {steps.map((label, index) => (
            <View
              key={label}
              style={[styles.segment, index < step && styles.segmentDone]}
            />
          ))}
        </View>
        <ThemedText variant="label" color={Colors.primary}>
          Paso {step} de {steps.length} · {stepLabel ?? steps[step - 1]}
        </ThemedText>
      </View>
      <View style={styles.spacer} />

      {children}

      {error && <InfoBanner tone="error" message={error} />}

      <ConfirmDialog
        visible={isExitOpen}
        icon={Info}
        title="¿Quieres salir?"
        description="Guardaremos tus avances como borrador. Puedes continuar desde la lista de productos."
        confirmLabel="Guardar borrador y salir"
        confirmVariant="primary"
        onConfirm={() => {
          setIsExitOpen(false);
          leave();
        }}
        onCancel={() => setIsExitOpen(false)}
      />
    </ScreenLayout>
  );
};

export default NewProductLayout;

const styles = StyleSheet.create({
  progress: {
    gap: spacing.sm,
  },
  segments: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  segmentDone: {
    backgroundColor: Colors.primary,
  },
  spacer: {
    height: 15,
  },
});
