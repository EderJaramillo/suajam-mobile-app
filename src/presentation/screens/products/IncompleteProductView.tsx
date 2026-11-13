import { Colors, iconStroke, radius, spacing } from "@/config/theme/theme";
import { loadProductForEdit, resumeRoute, type SavedDraft } from "@/features/products/newProductSlice";
import type { FullProductDetail } from "@/features/products/productDetailSlice";
import AppBar from "@/presentation/theme/components/AppBar";
import InfoBanner from "@/presentation/theme/components/InfoBanner";
import VisibleSwitch from "@/presentation/theme/components/new-product/VisibleSwitch";
import ArchiveProductDialog from "@/presentation/theme/components/products/ArchiveProductDialog";
import ScreenLayout from "@/presentation/theme/components/ScreenLayout";
import ThemedButton from "@/presentation/theme/components/ThemedButton";
import ThemedText from "@/presentation/theme/components/ThemedText";
import { useAppDispatch } from "@/store/hooks";
import { router, type Href } from "expo-router";
import { Archive, Circle, CircleCheck, PackageOpen, Pencil } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

export interface ChecklistItem {
  label: string;
  done: boolean;
  missing: string;
}

// "Antes de publicar" calculado con lo que ya está en el servidor.
export function detailChecklist(detail: FullProductDetail, photoCount: number): ChecklistItem[] {
  const presentations = (detail.product_models ?? []).flatMap((m) => m.presentations ?? []);
  return [
    { label: "Nombre y categoría", done: !!detail.name && !!detail.category, missing: "el nombre y la categoría" },
    { label: "Tipo de producto", done: !!detail.type, missing: "el tipo" },
    { label: "Al menos 1 foto", done: photoCount > 0, missing: "una foto" },
    { label: "Al menos 1 precio", done: presentations.some((p) => Number(p.price) > 0), missing: "un precio" },
    { label: "Descripción", done: !!detail.description?.trim(), missing: "la descripción" },
  ];
}

const joinList = (parts: string[]) =>
  parts.length > 1 ? `${parts.slice(0, -1).join(", ")} y ${parts.at(-1)}` : (parts[0] ?? "");

interface Props {
  detail: FullProductDetail;
  checklist: ChecklistItem[];
}

// Fase 4 / 10 (borrador sin tipo) y 11 (activación bloqueada).
const IncompleteProductView = ({ detail, checklist }: Props) => {
  const dispatch = useAppDispatch();
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const noType = !detail.type;
  const missing = checklist.filter((item) => !item.done).map((item) => item.missing);

  // Se retoma el alta justo donde se quedó (elegir tipo, precios o publicación).
  const onContinue = async () => {
    setIsOpening(true);
    const result = await dispatch(loadProductForEdit({ productId: detail.id, mode: "create" }));
    setIsOpening(false);
    if (loadProductForEdit.fulfilled.match(result)) {
      router.push(resumeRoute(result.payload as SavedDraft) as Href);
    }
  };

  return (
    <ScreenLayout
      header={<AppBar title="Detalle del producto" onBack={() => router.back()} />}
      footer={
        <ThemedButton
          title={noType ? "Elige cómo vendes este producto" : "Completar producto"}
          loading={isOpening}
          loadingTitle="Abriendo…"
          onPress={onContinue}
        />
      }
    >
      <View style={[styles.card, styles.header]}>
        <PackageOpen size={44} color={Colors.primary} strokeWidth={iconStroke} absoluteStrokeWidth />
        <View style={styles.flex}>
          <ThemedText variant="title">{detail.name}</ThemedText>
          <View style={styles.badge}>
            <Pencil size={12} color={Colors.primary} strokeWidth={iconStroke} absoluteStrokeWidth />
            <ThemedText variant="caption" color={Colors.primary}>
              Borrador
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={[styles.card, styles.checklist]}>
        <ThemedText variant="subtitle">Antes de publicar</ThemedText>
        {checklist.map((item) => {
          const Icon = item.done ? CircleCheck : Circle;
          return (
            <View key={item.label} style={styles.checkRow}>
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

      <View style={styles.visibleRow}>
        <View style={styles.flex}>
          <ThemedText variant="bodyMedium">Visible</ThemedText>
          <ThemedText variant="caption" color={Colors.textSecondary}>
            Completa el producto para activar
          </ThemedText>
        </View>
        <VisibleSwitch label="Visible" value={false} onChange={() => undefined} locked />
      </View>

      <InfoBanner
        tone="error"
        message={
          noType
            ? "Elige un tipo y completa fotos, precios y descripción."
            : `No se puede activar: agrega ${joinList(missing)}`
        }
      />
      <InfoBanner message="Un producto necesita un modelo visible; el modelo necesita al menos una variante o precio activo." />

      <View style={styles.archiveCard}>
        <ThemedButton
          title="Archivar producto"
          variant="text"
          icon={Archive}
          onPress={() => setIsArchiveOpen(true)}
        />
      </View>

      <ArchiveProductDialog
        productId={detail.id}
        visible={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
      />
    </ScreenLayout>
  );
};

export default IncompleteProductView;

const cardBase = {
  backgroundColor: Colors.surface,
  borderWidth: 1,
  borderColor: Colors.border,
  borderRadius: radius.md,
  shadowColor: "#291140",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.04,
  shadowRadius: 8,
  elevation: 1,
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  card: {
    ...cardBase,
    padding: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  badge: {
    alignSelf: "flex-start",
    height: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
    backgroundColor: Colors.selected,
  },
  checklist: {
    gap: spacing.xs,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  visibleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  archiveCard: {
    ...cardBase,
  },
});
