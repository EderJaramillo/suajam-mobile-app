import { Colors, iconStroke, radius, spacing } from "@/config/theme/theme";
import { MAX_PHOTOS, type DraftPhoto } from "@/features/products/newProductSlice";
import { Image } from "expo-image";
import { Camera } from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import ThemedText from "../ThemedText";
import PhotoSourceSheet from "./PhotoSourceSheet";

interface Props {
  photos: DraftPhoto[];
  onChange: (photos: DraftPhoto[]) => void;
  modelName: string;
}

// "Fotos del modelo": 5 espacios, la primera es la principal.
const PhotoSlots = ({ photos, onChange, modelName }: Props) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const onRemove = (photo: DraftPhoto) => {
    Alert.alert("¿Quitar foto?", "La foto dejará de estar en este modelo.", [
      { text: "Volver", style: "cancel" },
      {
        text: "Quitar",
        style: "destructive",
        onPress: () => onChange(photos.filter((p) => p.key !== photo.key)),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText variant="subtitle" style={styles.title}>
          Fotos del modelo
        </ThemedText>
        <ThemedText variant="caption" color={Colors.textSecondary}>
          {photos.length}/{MAX_PHOTOS}
        </ThemedText>
      </View>

      <View style={styles.slots}>
        {Array.from({ length: MAX_PHOTOS }, (_, index) => {
          const photo = photos[index];
          return photo ? (
            <Pressable
              key={photo.key}
              onPress={() => onRemove(photo)}
              style={styles.slot}
              accessibilityRole="button"
              accessibilityLabel={index === 0 ? "Foto principal" : `Foto ${index + 1}`}
              accessibilityHint="Quita la foto"
            >
              <Image source={photo.uri} style={styles.photo} contentFit="cover" />
            </Pressable>
          ) : (
            <Pressable
              key={`empty-${index}`}
              onPress={() => setIsSheetOpen(true)}
              style={styles.slot}
              accessibilityRole="button"
              accessibilityLabel="Agregar foto"
            >
              <Camera size={24} color={Colors.primary} strokeWidth={iconStroke} absoluteStrokeWidth />
            </Pressable>
          );
        })}
      </View>

      <ThemedText variant="caption" color={Colors.textSecondary}>
        La primera foto será la principal. Máximo {MAX_PHOTOS}.
      </ThemedText>

      <PhotoSourceSheet
        visible={isSheetOpen}
        modelName={modelName}
        remaining={MAX_PHOTOS - photos.length}
        onAdd={(added) => onChange([...photos, ...added].slice(0, MAX_PHOTOS))}
        onClose={() => setIsSheetOpen(false)}
      />
    </View>
  );
};

export default PhotoSlots;

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    flex: 1,
  },
  slots: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  slot: {
    flex: 1,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
});
