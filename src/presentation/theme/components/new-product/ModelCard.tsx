import { Colors, iconStroke, radius, spacing } from "@/config/theme/theme";
import { hasPrice, priceRange, type DraftModel } from "@/features/products/newProductSlice";
import { Image } from "expo-image";
import { ChevronRight } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import ThemedText from "../ThemedText";

interface Props {
  model: DraftModel;
  withVariants: boolean;
  onPress: () => void;
}

function describe(model: DraftModel, withVariants: boolean) {
  const range = priceRange(model);
  if (withVariants) {
    const count = model.variants.length;
    const prices = range ? (range.min === range.max ? ` · $${range.min}` : ` · $${range.min}–$${range.max}`) : "";
    return `${count} ${count === 1 ? "variante" : "variantes"}${prices}`;
  }
  return `1 precio · ${range ? `$${range.min}` : "Sin precio"}`;
}

function getStatus(model: DraftModel) {
  if (!model.variants.some(hasPrice)) return { text: "Falta precio", color: Colors.danger };
  if (model.photos.length === 0) return { text: "Falta foto", color: Colors.danger };
  return model.isActive
    ? { text: "Visible", color: Colors.primary }
    : { text: "Oculto", color: Colors.textSecondary };
}

// Fase 3 / 19 y 23: tarjeta de cada modelo con su estado.
const ModelCard = ({ model, withVariants, onPress }: Props) => {
  const photo = model.photos[0];
  const status = getStatus(model);

  return (
    <Pressable
      onPress={onPress}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`${model.name}, ${status.text}`}
    >
      {photo ? (
        <Image source={photo.uri} style={styles.photo} contentFit="cover" />
      ) : (
        <View style={styles.initial}>
          <ThemedText variant="title" color={Colors.primary}>
            {model.name.charAt(0).toUpperCase()}
          </ThemedText>
        </View>
      )}
      <View style={styles.content}>
        <ThemedText variant="bodyStrong" numberOfLines={1}>
          {model.name}
        </ThemedText>
        <ThemedText variant="caption" color={Colors.textSecondary}>
          {describe(model, withVariants)}
        </ThemedText>
        <ThemedText variant="caption" color={status.color}>
          {status.text}
        </ThemedText>
      </View>
      <ChevronRight size={20} color={Colors.textSecondary} strokeWidth={iconStroke} absoluteStrokeWidth />
    </Pressable>
  );
};

export default ModelCard;

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
