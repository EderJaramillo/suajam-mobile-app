import { Colors, iconStroke, radius, spacing } from "@/config/theme/theme";
import { resetDraft } from "@/features/products/newProductSlice";
import { fetchProducts } from "@/features/products/productsSlice";
import AppBar from "@/presentation/theme/components/AppBar";
import EmptyState from "@/presentation/theme/components/EmptyState";
import { useLeaveNewProduct } from "@/presentation/theme/components/new-product/NewProductLayout";
import ScreenLayout from "@/presentation/theme/components/ScreenLayout";
import ThemedButton from "@/presentation/theme/components/ThemedButton";
import ThemedText from "@/presentation/theme/components/ThemedText";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Check, CircleCheck, Plus, Share2, X } from "lucide-react-native";
import { Alert, Share, StyleSheet, View } from "react-native";

// Fase 3 / 40: el producto ya está visible.
const PublishedScreen = () => {
  const dispatch = useAppDispatch();
  const published = useAppSelector((s) => s.newProduct.published);
  const leave = useLeaveNewProduct();

  const name = published?.name ?? "Tu producto";

  const addAnother = () => {
    dispatch(resetDraft());
    dispatch(fetchProducts("refresh"));
    router.replace("/new-product");
  };

  return (
    <ScreenLayout
      compactTop
      header={
        <AppBar
          title="Producto publicado"
          onBack={leave}
          onAction={leave}
          actionIcon={X}
          actionLabel="Cerrar"
        />
      }
      footer={
        <>
          <ThemedButton title="Agregar otro producto" icon={Plus} onPress={addAnother} />
          <View style={styles.row}>
            <View style={styles.flex}>
              <ThemedButton
                title="Ver producto"
                variant="outline"
                onPress={() =>
                  Alert.alert("Próximamente", "El detalle del producto estará disponible pronto.")
                }
              />
            </View>
            <View style={styles.flex}>
              <ThemedButton
                title="Compartir"
                variant="outline"
                icon={Share2}
                onPress={() => Share.share({ message: `${name} ya está disponible en nuestra tienda.` })}
              />
            </View>
          </View>
        </>
      }
    >
      {published?.photo && (
        <Image source={published.photo} style={styles.photo} contentFit="cover" />
      )}

      <EmptyState
        icon={Check}
        title="¡Tu producto está publicado!"
        description={`${name} ya está visible en tu tienda y punto de venta.`}
      />

      <View style={styles.chip}>
        <CircleCheck size={14} color={Colors.successText} strokeWidth={iconStroke} absoluteStrokeWidth />
        <ThemedText variant="caption" color={Colors.successText}>
          Visible
        </ThemedText>
      </View>
    </ScreenLayout>
  );
};

export default PublishedScreen;

const styles = StyleSheet.create({
  photo: {
    width: "100%",
    height: 180,
    borderRadius: radius.md,
  },
  chip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm - 4,
    backgroundColor: Colors.successBackground,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
});
