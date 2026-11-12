import { Colors, iconStroke, radius, spacing } from "@/config/theme/theme";
import { VARIANTS_TYPE } from "@/features/products/productsTypes";
import InfoBanner from "@/presentation/theme/components/InfoBanner";
import AddModelSheet from "@/presentation/theme/components/new-product/AddModelSheet";
import ModelCard from "@/presentation/theme/components/new-product/ModelCard";
import NewProductLayout from "@/presentation/theme/components/new-product/NewProductLayout";
import ThemedButton from "@/presentation/theme/components/ThemedButton";
import ThemedText from "@/presentation/theme/components/ThemedText";
import { startEditingModel } from "@/features/products/newProductSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { router } from "expo-router";
import { Boxes, Network, Plus, Table } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

// Fase 3 / 19 (Con modelos) y 23 (Modelos con variantes).
const ModelsScreen = () => {
  const dispatch = useAppDispatch();
  const { name, typeId, models } = useAppSelector((s) => s.newProduct);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const withVariants = typeId === VARIANTS_TYPE;
  const TypeIcon = withVariants ? Network : Boxes;

  // Cada modelo se guarda al editarlo: "Continuar" solo pasa al paso 4.
  const onContinue = () => router.push("/new-product/publish");

  return (
    <NewProductLayout
      step={3}
      backExits
      footer={<ThemedButton title="Continuar" onPress={onContinue} />}
    >
      <View style={styles.titleRow}>
        <ThemedText variant="title" style={styles.title}>
          {withVariants ? "Colores y tallas" : `Modelos de ${name}`}
        </ThemedText>
        <View style={styles.badge}>
          <TypeIcon size={14} color={Colors.primary} strokeWidth={iconStroke} absoluteStrokeWidth />
          <ThemedText variant="caption" color={Colors.primary}>
            {withVariants ? "Con variantes" : "Con modelos"}
          </ThemedText>
        </View>
      </View>
      <ThemedText color={Colors.textSecondary}>
        {withVariants
          ? "Cada color tiene fotos. Cada talla tiene costo y precio."
          : "Cada modelo tiene sus propias fotos y precio."}
      </ThemedText>

      {models.map((model) => (
        <ModelCard
          key={model.key}
          model={model}
          withVariants={withVariants}
          onPress={() => {
            dispatch(startEditingModel(model.key));
            router.push("/new-product/model");
          }}
        />
      ))}

      <ThemedButton
        title="Agregar modelo"
        variant="outline"
        icon={Plus}
        onPress={() => setIsAddOpen(true)}
      />

      {withVariants && (
        <ThemedButton
          title="Ver tabla de precios"
          variant="text"
          icon={Table}
          onPress={() => router.push("/new-product/price-table")}
        />
      )}

      <InfoBanner
        message={
          withVariants
            ? "Las variantes nuevas estarán visibles cuando tengan costo y precio."
            : "La primera foto del primer modelo será la miniatura del producto."
        }
      />

      <AddModelSheet
        visible={isAddOpen}
        withPrice={!withVariants}
        onClose={() => setIsAddOpen(false)}
      />
    </NewProductLayout>
  );
};

export default ModelsScreen;

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
