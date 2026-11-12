import { Colors, iconStroke, radius, spacing } from "@/config/theme/theme";
import { hasPrice, setFirstModelPhotos, updateDraft } from "@/features/products/newProductSlice";
import NewProductLayout from "@/presentation/theme/components/new-product/NewProductLayout";
import PhotoSlots from "@/presentation/theme/components/new-product/PhotoSlots";
import PriceFields from "@/presentation/theme/components/new-product/PriceFields";
import ThemedButton from "@/presentation/theme/components/ThemedButton";
import ThemedText from "@/presentation/theme/components/ThemedText";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { router } from "expo-router";
import { Package } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

// Fase 3 / 14 y hoja "Agregar foto" (16 a 18).
const SimplePricesScreen = () => {
  const dispatch = useAppDispatch();
  const { name, cost, price, models } = useAppSelector((s) => s.newProduct);
  const photos = models[0]?.photos ?? [];

  return (
    <NewProductLayout
      step={3}
      backExits
      footer={
        <ThemedButton
          title="Continuar: oferta y canales"
          disabled={!hasPrice({ cost, price })}
          onPress={() => router.push("/new-product/channels")}
        />
      }
    >
      <View style={styles.titleRow}>
        <ThemedText variant="subtitle" style={styles.title}>
          {name}
        </ThemedText>
        <View style={styles.badge}>
          <Package size={14} color={Colors.primary} strokeWidth={iconStroke} absoluteStrokeWidth />
          <ThemedText variant="caption" color={Colors.primary}>
            Simple
          </ThemedText>
        </View>
      </View>

      <PhotoSlots
        photos={photos}
        modelName={name}
        onChange={(next) => dispatch(setFirstModelPhotos(next))}
      />

      <PriceFields cost={cost} price={price} onChange={(changes) => dispatch(updateDraft(changes))} />
    </NewProductLayout>
  );
};

export default SimplePricesScreen;

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    flex: 1,
  },
  badge: {
    height: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm - 4,
    backgroundColor: Colors.selected,
  },
});
