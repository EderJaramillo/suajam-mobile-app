import { Colors, iconStroke, radius, spacing } from "@/config/theme/theme";
import { SIMPLE_TYPE, VARIANTS_TYPE } from "@/features/products/productsTypes";
import AppBar from "@/presentation/theme/components/AppBar";
import { money } from "@/presentation/theme/components/new-product/PricePreview";
import ArchiveProductDialog from "@/presentation/theme/components/products/ArchiveProductDialog";
import ScreenLayout from "@/presentation/theme/components/ScreenLayout";
import ThemedButton from "@/presentation/theme/components/ThemedButton";
import ThemedText from "@/presentation/theme/components/ThemedText";
import { useAppSelector } from "@/store/hooks";
import { router, type Href } from "expo-router";
import {
  Archive,
  ChevronDown,
  FileText,
  Images,
  ListFilter,
  Percent,
  Store,
  Tag,
  type LucideIcon,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

const rate = (value: string) => (Number(value) === 0 ? "No aplica" : `${value}%`);

// Fase 4 / 04: todas las secciones del producto.
const MoreSectionsScreen = () => {
  const draft = useAppSelector((s) => s.newProduct);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const productId = draft.productId ?? 0;
  const isSimple = draft.typeId === SIMPLE_TYPE;

  const variants = draft.models.flatMap((m) => m.variants);
  const pricing = isSimple
    ? `${money(Number(draft.price) || 0)} · Costo ${money(Number(draft.cost) || 0)}`
    : [
        draft.models.map((m) => m.name).join(", ").replace(/, ([^,]*)$/, " y $1"),
        draft.typeId === VARIANTS_TYPE ? `${variants.length} variantes` : null,
      ]
        .filter(Boolean)
        .join(" · ");

  // "Marca: Local · Material: Algodón"
  const byFilter = new Map<string, string[]>();
  for (const label of draft.appliedLabels) {
    byFilter.set(label.filterName, [...(byFilter.get(label.filterName) ?? []), label.labelName]);
  }
  const labels = [...byFilter].map(([filter, names]) => `${filter}: ${names.join(", ")}`).join(" · ");

  const channels =
    draft.showOnStore && draft.showOnPos
      ? "Tienda en línea y Punto de venta"
      : draft.showOnStore
        ? "Solo tienda en línea"
        : draft.showOnPos
          ? "Solo punto de venta"
          : "Sin canales";

  const docs = draft.documents.length;

  const rows: { icon: LucideIcon; title: string; subtitle: string; section: string }[] = [
    { icon: FileText, title: "Información general", subtitle: "Nombre, descripción y SKU", section: "general" },
    {
      icon: Images,
      title: isSimple ? "Fotos y precio" : "Fotos, precios y modelos",
      subtitle: pricing || "Sin modelos",
      section: "pricing",
    },
    { icon: Tag, title: "Categoría", subtitle: draft.category?.name ?? "Sin categoría", section: "general" },
    { icon: ListFilter, title: "Filtros y etiquetas", subtitle: labels || "Sin etiquetas", section: "labels" },
    { icon: Store, title: "Canales", subtitle: channels, section: "channels" },
    {
      icon: Percent,
      title: "Impuestos",
      subtitle: `IVA ${rate(draft.ivaRate)} · IEPS ${rate(draft.iepsRate)}`,
      section: "taxes",
    },
    {
      icon: FileText,
      title: "Documentos",
      subtitle: docs === 0 ? "Sin documentos" : `${docs} ${docs === 1 ? "archivo PDF" : "archivos PDF"}`,
      section: "documents",
    },
  ];

  return (
    <ScreenLayout header={<AppBar title="Detalle del producto" onBack={() => router.back()} />}>
      <View style={styles.intro}>
        <ThemedText variant="title">Más información</ThemedText>
        <ThemedText color={Colors.textSecondary}>{draft.name}</ThemedText>
      </View>

      <View style={styles.card}>
        {rows.map(({ icon: Icon, title, subtitle, section }) => (
          <Pressable
            key={title}
            style={styles.row}
            onPress={() => router.push(`/product/${productId}/${section}` as Href)}
            accessibilityRole="button"
            accessibilityLabel={title}
          >
            <Icon size={24} color={Colors.primary} strokeWidth={iconStroke} absoluteStrokeWidth />
            <View style={styles.flex}>
              <ThemedText variant="bodyMedium">{title}</ThemedText>
              <ThemedText variant="caption" color={Colors.textSecondary} numberOfLines={1}>
                {subtitle}
              </ThemedText>
            </View>
            <ChevronDown size={24} color={Colors.textSecondary} strokeWidth={iconStroke} absoluteStrokeWidth />
          </Pressable>
        ))}
      </View>

      <View style={styles.archiveCard}>
        <ThemedButton
          title="Archivar producto"
          variant="text"
          icon={Archive}
          onPress={() => setIsArchiveOpen(true)}
        />
      </View>

      <ArchiveProductDialog
        productId={productId}
        visible={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
      />
    </ScreenLayout>
  );
};

export default MoreSectionsScreen;

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
  intro: {
    gap: spacing.xs,
  },
  card: {
    ...cardBase,
    padding: spacing.lg,
  },
  archiveCard: {
    ...cardBase,
  },
  row: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
});
