import { Colors, spacing } from "@/config/theme/theme";
import { loadProductForEdit } from "@/features/products/newProductSlice";
import AppBar from "@/presentation/theme/components/AppBar";
import InfoBanner from "@/presentation/theme/components/InfoBanner";
import ScreenLayout from "@/presentation/theme/components/ScreenLayout";
import ThemedButton from "@/presentation/theme/components/ThemedButton";
import { useAppDispatch } from "@/store/hooks";
import { router } from "expo-router";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";

interface Props {
  productId: number;
  children: () => ReactNode;
}

// Fase 4: carga el producto del servidor en el borrador (modo edición) antes de mostrar
// la pantalla, así cada sección compara sus cambios contra lo guardado.
const EditLoader = ({ productId, children }: Props) => {
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    () =>
      dispatch(loadProductForEdit({ productId, mode: "edit" })).then((result) => {
        if (loadProductForEdit.fulfilled.match(result)) {
          setStatus("ready");
        } else {
          setError(result.payload ?? "No pudimos cargar el producto.");
          setStatus("error");
        }
      }),
    [dispatch, productId],
  );

  useEffect(() => {
    load();
  }, [load]);

  if (status === "ready") return <>{children()}</>;

  return (
    <ScreenLayout header={<AppBar title="Detalle del producto" onBack={() => router.back()} />}>
      {status === "error" ? (
        <>
          <InfoBanner tone="error" message={error ?? "No pudimos cargar el producto."} />
          <ThemedButton
            title="Intentar de nuevo"
            variant="outline"
            onPress={() => {
              setStatus("loading");
              load();
            }}
          />
        </>
      ) : (
        <ActivityIndicator color={Colors.primary} style={styles.loading} />
      )}
    </ScreenLayout>
  );
};

export default EditLoader;

const styles = StyleSheet.create({
  loading: {
    marginTop: spacing.xl,
  },
});
