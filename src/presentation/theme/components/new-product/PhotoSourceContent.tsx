import { Colors, iconStroke, radius, spacing } from "@/config/theme/theme";
import { fetchSavedImages, newKey, type DraftPhoto } from "@/features/products/newProductSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import {
  Camera,
  ChevronRight,
  Image as ImageIcon,
  Images,
  Link,
  type LucideIcon,
} from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import InfoBanner from "../InfoBanner";
import ThemedButton from "../ThemedButton";
import ThemedText from "../ThemedText";
import ThemedTextInput from "../ThemedTextInput";
import SheetCard from "./SheetCard";

type Mode = "menu" | "url" | "existing";

interface Props {
  modelName: string;
  remaining: number;
  onAdd: (photos: DraftPhoto[]) => void;
  onDone: () => void;
}

const toPhoto = (uri: string, source: DraftPhoto["source"]): DraftPhoto => ({
  key: newKey("photo"),
  uri,
  source,
  uploaded: false,
});

const isImageUrl = (text: string) => /^https?:\/\/\S+$/i.test(text.trim());

// Fase 3 / 16 (agregar foto), 17 (pegar enlace) y 18 (usar foto ya subida).
// Es solo el contenido: lo usa la hoja de fotos y la hoja de "Agregar modelo".
const PhotoSourceContent = ({ modelName, remaining, onAdd, onDone }: Props) => {
  const dispatch = useAppDispatch();
  const { savedImages, isSaving } = useAppSelector((s) => s.newProduct);

  const [mode, setMode] = useState<Mode>("menu");
  const [url, setUrl] = useState("");
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  const finish = (photos: DraftPhoto[]) => {
    onAdd(photos);
    onDone();
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Sin permiso", "Necesitamos tu cámara para tomar la foto.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.8 });
    if (!result.canceled) finish(result.assets.map((a) => toPhoto(a.uri, "device")));
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    });
    if (!result.canceled) {
      finish(result.assets.slice(0, remaining).map((a) => toPhoto(a.uri, "device")));
    }
  };

  const openExisting = () => {
    setMode("existing");
    dispatch(fetchSavedImages());
  };

  const options: { icon: LucideIcon; title: string; subtitle?: string; onPress: () => void }[] = [
    { icon: Camera, title: "Tomar foto", onPress: takePhoto },
    {
      icon: Images,
      title: "Elegir de galería del teléfono",
      subtitle: "Puedes elegir varias fotos",
      onPress: pickFromGallery,
    },
    { icon: ImageIcon, title: "Usar foto ya subida", onPress: openExisting },
    { icon: Link, title: "Pegar enlace URL", onPress: () => setMode("url") },
  ];

  if (mode === "url") {
    return (
      <SheetCard title="Pegar enlace de foto">
        <ThemedTextInput
          label="Enlace de la imagen"
          placeholder="https://ejemplo.com/foto.jpg"
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          error={url && !isImageUrl(url) ? "Escribe un enlace válido" : null}
        />
        <ThemedText variant="caption" color={Colors.textSecondary}>
          Usa un enlace público que termine en una imagen.
        </ThemedText>
        <ThemedButton
          title="Usar foto"
          disabled={!isImageUrl(url)}
          onPress={() => finish([toPhoto(url.trim(), "url")])}
        />
        <ThemedButton title="Volver" variant="text" onPress={() => setMode("menu")} />
      </SheetCard>
    );
  }

  if (mode === "existing") {
    const selected = savedImages.find((img) => img.url === selectedUrl);
    return (
      <SheetCard title="Usar foto ya subida">
        {isSaving && savedImages.length === 0 ? (
          <InfoBanner message="Cargando tus fotos…" />
        ) : savedImages.length === 0 ? (
          <InfoBanner message="Todavía no hay fotos guardadas en tu negocio." />
        ) : (
          <View style={styles.grid}>
            {savedImages.map((img) => (
              <Pressable
                key={img.url}
                onPress={() => setSelectedUrl(img.url)}
                style={[styles.thumb, img.url === selectedUrl && styles.thumbSelected]}
                accessibilityRole="radio"
                accessibilityState={{ selected: img.url === selectedUrl }}
                accessibilityLabel={`Foto de ${img.modelName || "un modelo"}`}
              >
                <Image source={img.url} style={styles.thumbImage} contentFit="cover" />
              </Pressable>
            ))}
          </View>
        )}
        {selected && (
          <InfoBanner
            message={`Seleccionada: ${selected.productName || "Foto de tu negocio"}${selected.modelName ? ` · Modelo ${selected.modelName}` : ""}`}
          />
        )}
        <ThemedButton
          title="Usar foto seleccionada"
          disabled={!selected}
          onPress={() => selected && finish([toPhoto(selected.url, "existing")])}
        />
        <ThemedButton title="Volver" variant="text" onPress={() => setMode("menu")} />
      </SheetCard>
    );
  }

  return (
    <SheetCard title={modelName ? `Agregar foto · ${modelName}` : "Agregar foto"}>
      {remaining <= 0 ? (
        <InfoBanner tone="warning" message="Este modelo ya tiene 5 fotos. Quita una para agregar otra." />
      ) : (
        options.map(({ icon: Icon, title, subtitle, onPress }) => (
          <Pressable key={title} style={styles.option} accessibilityRole="button" onPress={onPress}>
            <Icon size={24} color={Colors.primary} strokeWidth={iconStroke} absoluteStrokeWidth />
            <View style={styles.text}>
              <ThemedText variant="bodyMedium">{title}</ThemedText>
              {subtitle && (
                <ThemedText variant="caption" color={Colors.textSecondary}>
                  {subtitle}
                </ThemedText>
              )}
            </View>
            <ChevronRight
              size={24}
              color={Colors.textSecondary}
              strokeWidth={iconStroke}
              absoluteStrokeWidth
            />
          </Pressable>
        ))
      )}
    </SheetCard>
  );
};

export default PhotoSourceContent;

const styles = StyleSheet.create({
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  text: {
    flex: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  thumb: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbSelected: {
    borderColor: Colors.primary,
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
});
