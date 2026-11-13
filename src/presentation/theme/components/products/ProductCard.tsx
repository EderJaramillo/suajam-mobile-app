import { Colors, iconStroke, radius, spacing } from "@/config/theme/theme";
import {
  getProductImage,
  getProductPrice,
  isIncomplete,
  type Product,
} from "@/features/products/productsTypes";
import { Image } from "expo-image";
import { ChevronRight } from "lucide-react-native";
import { useState } from "react";
import { PanResponder, Pressable, StyleSheet, View } from "react-native";
import ThemedText from "../ThemedText";

interface Props {
  product: Product;
  onToggleActions: () => void;
  // Tocar la tarjeta abre el detalle; deslizarla muestra las acciones.
  onOpen?: () => void;
}

function getStatus(product: Product) {
  if (isIncomplete(product)) {
    return { text: "Borrador · Falta elegir tipo", color: Colors.danger };
  }
  const label = product.is_active ? "Visible" : "Oculto";
  const price = getProductPrice(product);
  return { text: price === null ? label : `${label} · $${price}`, color: Colors.primary };
}

const ProductCard = ({ product, onToggleActions, onOpen }: Props) => {
  const image = getProductImage(product);
  const status = getStatus(product);

  // Deslizar la tarjeta hacia los lados muestra u oculta sus acciones.
  const [panResponder] = useState(() =>
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) => Math.abs(dx) > 20 && Math.abs(dx) > Math.abs(dy),
      onPanResponderRelease: onToggleActions,
    }),
  );

  return (
    <View {...panResponder.panHandlers}>
      <Pressable
        onPress={onOpen ?? onToggleActions}
        style={styles.card}
        accessibilityRole="button"
        accessibilityLabel={`${product.name}, ${status.text}`}
        accessibilityHint={onOpen ? "Abre el detalle del producto" : "Muestra las acciones del producto"}
      >
        {image ? (
          <Image source={image} style={styles.photo} contentFit="cover" />
        ) : (
          <View style={styles.initial}>
            <ThemedText variant="title" color={Colors.primary}>
              {product.name.charAt(0).toUpperCase()}
            </ThemedText>
          </View>
        )}
        <View style={styles.content}>
          <ThemedText variant="bodyStrong" numberOfLines={1}>
            {product.name}
          </ThemedText>
          <ThemedText variant="caption" color={Colors.textSecondary} numberOfLines={1}>
            {product.category?.name ?? "Sin categoría"} · {product.sku || "Sin SKU"}
          </ThemedText>
          <ThemedText variant="caption" color={status.color} numberOfLines={1}>
            {status.text}
          </ThemedText>
        </View>
        <ChevronRight
          size={20}
          color={Colors.textSecondary}
          strokeWidth={iconStroke}
          absoluteStrokeWidth
        />
      </Pressable>
    </View>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: radius.md,
  },
  photo: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
  },
  initial: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: Colors.selected,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
});
