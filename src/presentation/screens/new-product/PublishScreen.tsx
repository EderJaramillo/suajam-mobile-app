import { Colors, iconStroke, radius, spacing } from "@/config/theme/theme";
import {
  getPublishChecklist,
  publishProduct,
  updateDraft,
} from "@/features/products/newProductSlice";
import InfoBanner from "@/presentation/theme/components/InfoBanner";
import ExtrasSheet from "@/presentation/theme/components/new-product/ExtrasSheet";
import DescriptionField from "@/presentation/theme/components/new-product/DescriptionField";
import NewProductLayout, {
  useLeaveNewProduct,
} from "@/presentation/theme/components/new-product/NewProductLayout";
import ThemedButton from "@/presentation/theme/components/ThemedButton";
import ThemedText from "@/presentation/theme/components/ThemedText";
import ThemedTextInput from "@/presentation/theme/components/ThemedTextInput";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { router } from "expo-router";
import { ChevronRight, Circle, CircleCheck } from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

// "fotos, un precio y la descripción" a partir de lo que falta.
function missingMessage(labels: string[]) {
  const names: Record<string, string> = {
    "Nombre y categoría": "el nombre y la categoría",
    "Tipo de producto": "el tipo de producto",
    "Al menos 1 foto": "fotos",
    "Al menos 1 precio": "un precio",
    Descripción: "la descripción",
  };
  const parts = labels.map((label) => names[label] ?? label.toLowerCase());
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(", ")} y ${parts.at(-1)}` : parts[0];
  return `Agrega ${list} para publicar.`;
}

// Fase 3 / 34 (incompleta) y 35 (válida).
const PublishScreen = () => {
  const dispatch = useAppDispatch();
  const draft = useAppSelector((s) => s.newProduct);
  const leave = useLeaveNewProduct();
  const [action, setAction] = useState<"publish" | "hide" | null>(null);
  const [touched, setTouched] = useState(false);
  const [isExtrasOpen, setIsExtrasOpen] = useState(false);

  const checklist = getPublishChecklist(draft);
  const missing = checklist.filter((item) => !item.done);
  const canPublish = missing.length === 0;

  const onSubmit = async (publish: boolean) => {
    setTouched(true);
    setAction(publish ? "publish" : "hide");
    const result = await dispatch(publishProduct({ publish }));
    setAction(null);
    if (!publishProduct.fulfilled.match(result)) return;
    if (publish) {
      router.replace("/new-product/published");
    } else {
      Alert.alert("Producto guardado", "Quedó oculto. Puedes publicarlo después.", [
        { text: "Entendido", onPress: leave },
      ]);
    }
  };

  return (
    <NewProductLayout
      step={4}
      footer={
        <>
          <ThemedButton
            title="Publicar producto"
            loading={action === "publish"}
            loadingTitle="Publicando…"
            disabled={!canPublish || action !== null}
            onPress={() => onSubmit(true)}
          />
          <ThemedButton
            title="Guardar como oculto"
            variant="outline"
            loading={action === "hide"}
            loadingTitle="Guardando…"
            disabled={action !== null}
            onPress={() => onSubmit(false)}
          />
        </>
      }
    >
      <DescriptionField
        value={draft.description}
        onChange={(description) => {
          setTouched(true);
          dispatch(updateDraft({ description }));
        }}
        error={touched && !draft.description.trim() ? "Campo requerido" : null}
      />

      <ThemedTextInput
        label="SKU (opcional)"
        placeholder="Ej. PLY-001"
        value={draft.sku}
        onChangeText={(sku) => dispatch(updateDraft({ sku }))}
        autoCapitalize="characters"
        maxLength={50}
      />

      <View style={styles.card}>
        <ThemedText variant="subtitle">Antes de publicar</ThemedText>
        {checklist.map((item) => {
          const Icon = item.done ? CircleCheck : Circle;
          return (
            <View
              key={item.key}
              style={styles.checkRow}
              accessibilityLabel={`${item.label}: ${item.done ? "listo" : "pendiente"}`}
            >
              <Icon
                size={20}
                color={item.done ? Colors.success : Colors.textSecondary}
                strokeWidth={iconStroke}
                absoluteStrokeWidth
              />
              <ThemedText variant="caption">{item.label}</ThemedText>
            </View>
          );
        })}
      </View>

      {canPublish ? (
        <Pressable
          onPress={() => setIsExtrasOpen(true)}
          style={styles.moreRow}
          accessibilityRole="button"
        >
          <View style={styles.flex}>
            <ThemedText variant="bodyMedium">Impuestos, canales y más</ThemedText>
            <ThemedText variant="caption" color={Colors.textSecondary}>
              Filtros, etiquetas y documentos
            </ThemedText>
          </View>
          <ChevronRight
            size={24}
            color={Colors.textSecondary}
            strokeWidth={iconStroke}
            absoluteStrokeWidth
          />
        </Pressable>
      ) : (
        <InfoBanner tone="error" message={missingMessage(missing.map((m) => m.label))} />
      )}
      <ExtrasSheet visible={isExtrasOpen} onClose={() => setIsExtrasOpen(false)} />
    </NewProductLayout>
  );
};

export default PublishScreen;

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
    padding: spacing.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: radius.md,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  moreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
});
