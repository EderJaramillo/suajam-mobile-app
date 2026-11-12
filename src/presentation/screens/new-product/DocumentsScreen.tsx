import { Colors, iconStroke, radius, spacing } from "@/config/theme/theme";
import {
  MAX_DOCUMENT_BYTES,
  newKey,
  saveDocuments,
  type DocumentItem,
} from "@/features/products/newProductSlice";
import InfoBanner from "@/presentation/theme/components/InfoBanner";
import NewProductLayout from "@/presentation/theme/components/new-product/NewProductLayout";
import ThemedButton from "@/presentation/theme/components/ThemedButton";
import ThemedText from "@/presentation/theme/components/ThemedText";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import { FileText, Trash2, Upload } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

// Fase 3 / 39: los PDF se eligen aquí y se suben al tocar "Guardar documentos".
const DocumentsScreen = () => {
  const dispatch = useAppDispatch();
  const { documents, isSaving } = useAppSelector((s) => s.newProduct);
  const [items, setItems] = useState<DocumentItem[]>(() =>
    documents.map((d) => ({
      key: `doc-${d.id}`,
      id: d.id,
      uri: null,
      name: d.name,
      sizeBytes: d.sizeBytes,
    })),
  );
  const [tooBig, setTooBig] = useState(false);

  const addPdf = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      multiple: true,
      // Sin copia: en Expo Go la copia en caché no se puede leer para subirla.
      // La URI original del selector sí trae permiso de lectura.
      copyToCacheDirectory: false,
    });
    if (result.canceled) return;
    const fits = result.assets.filter((asset) => (asset.size ?? 0) <= MAX_DOCUMENT_BYTES);
    setTooBig(fits.length < result.assets.length);
    setItems((current) => [
      ...current,
      ...fits.map((asset) => ({
        key: newKey("doc"),
        id: null,
        uri: asset.uri,
        name: asset.name,
        sizeBytes: asset.size ?? 0,
      })),
    ]);
  };

  const onSave = async () => {
    const result = await dispatch(saveDocuments(items));
    if (saveDocuments.fulfilled.match(result)) router.back();
  };

  return (
    <NewProductLayout
      step={4}
      stepLabel="Publicación"
      footer={
        <ThemedButton
          title="Guardar documentos"
          loading={isSaving}
          loadingTitle="Subiendo…"
          onPress={onSave}
        />
      }
    >
      <ThemedText variant="title">Documentos del producto</ThemedText>
      <ThemedText color={Colors.textSecondary}>
        Agrega fichas técnicas o instrucciones en PDF. Máximo 50 MB por archivo.
      </ThemedText>

      {items.length > 0 && (
        <View style={styles.card}>
          {items.map((item) => (
            <View key={item.key} style={styles.row}>
              <FileText
                size={24}
                color={Colors.primary}
                strokeWidth={iconStroke}
                absoluteStrokeWidth
              />
              <View style={styles.text}>
                <ThemedText variant="bodyMedium" numberOfLines={1}>
                  {item.name}
                </ThemedText>
                <ThemedText variant="caption" color={Colors.textSecondary}>
                  PDF · {formatSize(item.sizeBytes)}
                </ThemedText>
              </View>
              <Pressable
                onPress={() => setItems((current) => current.filter((i) => i.key !== item.key))}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={`Quitar ${item.name}`}
              >
                <Trash2
                  size={24}
                  color={Colors.textSecondary}
                  strokeWidth={iconStroke}
                  absoluteStrokeWidth
                />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <ThemedButton title="Agregar PDF" variant="outline" icon={Upload} onPress={addPdf} />

      {tooBig && (
        <InfoBanner
          tone="error"
          message="Este archivo supera los 50 MB. Elige un PDF más pequeño."
        />
      )}
    </NewProductLayout>
  );
};

export default DocumentsScreen;

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: radius.md,
    shadowColor: "#291140",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  row: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  text: {
    flex: 1,
    gap: 2,
  },
});
