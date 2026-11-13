import { Colors, iconStroke, radius, spacing } from "@/config/theme/theme";
import {
  clearDetailError,
  fetchProductDetail,
  setDetailVisibility,
  type FullProductDetail,
} from "@/features/products/productDetailSlice";
import { MODELS_TYPE, SIMPLE_TYPE, VARIANTS_TYPE } from "@/features/products/productsTypes";
import AppBar from "@/presentation/theme/components/AppBar";
import InfoBanner from "@/presentation/theme/components/InfoBanner";
import { money } from "@/presentation/theme/components/new-product/PricePreview";
import VisibleSwitch from "@/presentation/theme/components/new-product/VisibleSwitch";
import ScreenLayout from "@/presentation/theme/components/ScreenLayout";
import ThemedText from "@/presentation/theme/components/ThemedText";
import IncompleteProductView, { detailChecklist } from "./IncompleteProductView";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Image } from "expo-image";
import { router, useLocalSearchParams, type Href } from "expo-router";
import {
  Boxes,
  ChevronDown,
  FileText,
  Lock,
  Network,
  Package,
  Share2,
  Tag,
  type LucideIcon,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Share,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from "react-native";

const typeInfo: Record<number, { label: string; icon: LucideIcon }> = {
  [SIMPLE_TYPE]: { label: "Simple", icon: Package },
  [MODELS_TYPE]: { label: "Con modelos", icon: Boxes },
  [VARIANTS_TYPE]: { label: "Modelos con variantes", icon: Network },
};

const rate = (value: string | null) => (Number(value ?? 0) === 0 ? "No aplica" : `${Number(value)}%`);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });

function channelsText(detail: FullProductDetail) {
  if (detail.display_on_store && detail.display_on_pos) return "En tienda y punto de venta";
  if (detail.display_on_store) return "Solo en tienda en línea";
  if (detail.display_on_pos) return "Solo en punto de venta";
  return "Sin canales elegidos";
}

const range = (values: number[]) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return min === max ? money(min) : `${money(min)}–${money(max)}`;
};

// Resúmenes de las secciones, como en Fase 4 / 01–03.
function summaries(detail: FullProductDetail) {
  const models = detail.product_models ?? [];
  const presentations = models.flatMap((m) => m.presentations ?? []);
  const prices = presentations.map((p) => Number(p.price)).filter((n) => n > 0);
  const costs = presentations.map((p) => Number(p.cost)).filter((n) => n > 0);

  if (detail.type === SIMPLE_TYPE) {
    const price = prices[0] ?? 0;
    const cost = costs[0] ?? 0;
    return {
      pricing: `${money(price)} · Costo ${money(cost)} · IVA ${rate(detail.iva_rate)}`,
      footer: `Margen ${money(price - cost)}`,
    };
  }
  const parts = [`${models.length} ${models.length === 1 ? "modelo" : "modelos"}`];
  if (detail.type === VARIANTS_TYPE) {
    parts.push(`${presentations.length} ${presentations.length === 1 ? "variante" : "variantes"}`);
  }
  if (prices.length) parts.push(range(prices));
  const unit = detail.type === VARIANTS_TYPE ? "variante" : "modelo";
  return {
    pricing: parts.join(" · "),
    footer: costs.length ? `Costo ${range(costs)} por ${unit}` : "Sin costo capturado",
  };
}

interface RowProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onPress: () => void;
}

const SectionRow = ({ icon: Icon, title, subtitle, onPress }: RowProps) => (
  <Pressable style={styles.row} onPress={onPress} accessibilityRole="button" accessibilityLabel={title}>
    <Icon size={24} color={Colors.primary} strokeWidth={iconStroke} absoluteStrokeWidth />
    <View style={styles.flex}>
      <ThemedText variant="bodyMedium">{title}</ThemedText>
      <ThemedText variant="caption" color={Colors.textSecondary} numberOfLines={1}>
        {subtitle}
      </ThemedText>
    </View>
    <ChevronDown size={24} color={Colors.textSecondary} strokeWidth={iconStroke} absoluteStrokeWidth />
  </Pressable>
);

// Fase 4 / 01 (Simple), 02 (Con modelos) y 03 (Modelos con variantes).
const ProductDetailScreen = () => {
  const dispatch = useAppDispatch();
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = Number(id);
  const { detail, photos, status, isSaving, error } = useAppSelector((s) => s.productDetail);
  const categories = useAppSelector((s) => s.products.categories);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [photoWidth, setPhotoWidth] = useState(0);

  useEffect(() => {
    dispatch(fetchProductDetail(productId));
  }, [dispatch, productId]);

  const openSection = (section: string) =>
    router.push(`/product/${productId}/${section}` as Href);

  if (!detail || detail.id !== productId) {
    return (
      <ScreenLayout header={<AppBar title="Detalle del producto" onBack={() => router.back()} />}>
        {status === "error" ? (
          <InfoBanner tone="error" message={error ?? "No pudimos cargar el producto."} />
        ) : (
          <ActivityIndicator color={Colors.primary} style={styles.loading} />
        )}
      </ScreenLayout>
    );
  }

  // Fase 4 / 10 y 11: si falta algo para publicarlo y está oculto, se muestra como borrador.
  const checklist = detailChecklist(detail, photos.length);
  if (!detail.is_active && checklist.some((item) => !item.done)) {
    return <IncompleteProductView detail={detail} checklist={checklist} />;
  }

  const type = detail.type ? typeInfo[detail.type] : null;
  const TypeIcon = type?.icon ?? Package;
  const category =
    (typeof detail.category === "object" && detail.category
      ? detail.category.name
      : categories.find((c) => c.id === detail.category)?.name) ?? "Sin categoría";
  const { pricing, footer } = summaries(detail);
  const isSimple = detail.type === SIMPLE_TYPE;
  const current = photos[photoIndex];

  return (
    <ScreenLayout
      header={
        <AppBar
          title="Detalle del producto"
          onBack={() => router.back()}
          onAction={() => Share.share({ message: `${detail.name} ya está disponible en nuestra tienda.` })}
          actionIcon={Share2}
          actionLabel="Compartir producto"
        />
      }
    >
      <View style={styles.block}>
        <View
          style={styles.photoFrame}
          onLayout={(e: LayoutChangeEvent) => setPhotoWidth(e.nativeEvent.layout.width)}
        >
          {photos.length > 0 && photoWidth > 0 ? (
            <FlatList
              data={photos}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(photo) => photo.url}
              onMomentumScrollEnd={(e) =>
                setPhotoIndex(Math.round(e.nativeEvent.contentOffset.x / photoWidth))
              }
              renderItem={({ item }) => (
                <Image source={item.url} style={[styles.photo, { width: photoWidth }]} contentFit="cover" />
              )}
            />
          ) : (
            <View style={styles.noPhoto}>
              <Package size={40} color={Colors.primary} strokeWidth={iconStroke} absoluteStrokeWidth />
            </View>
          )}
        </View>
        <View style={styles.photoRow}>
          <ThemedText variant="caption" color={Colors.textSecondary} style={styles.flex}>
            {photos.length === 0
              ? "Sin fotos"
              : `${photoIndex === 0 ? "Foto principal" : `Foto ${photoIndex + 1}`}${
                  isSimple ? ` · ${category}` : current?.modelName ? ` · ${current.modelName}` : ""
                }`}
          </ThemedText>
          {photos.length > 1 && (
            <ThemedText variant="caption" color={Colors.primary}>
              {photos.map((_, i) => (i === photoIndex ? "●" : "○")).join(" ")}
            </ThemedText>
          )}
        </View>
      </View>

      <View style={styles.block}>
        <ThemedText variant="title">{detail.name}</ThemedText>
        {type && (
          <View style={styles.badge}>
            <TypeIcon size={14} color={Colors.primary} strokeWidth={iconStroke} absoluteStrokeWidth />
            <ThemedText variant="caption" color={Colors.primary}>
              {type.label}
            </ThemedText>
          </View>
        )}
        <View style={styles.lockRow}>
          <Lock size={16} color={Colors.textSecondary} strokeWidth={iconStroke} absoluteStrokeWidth />
          <ThemedText variant="caption" color={Colors.textSecondary}>
            El tipo no se puede cambiar
          </ThemedText>
        </View>
      </View>

      <View style={[styles.card, styles.visibleCard]}>
        <View style={styles.row}>
          <View style={styles.flex}>
            <ThemedText variant="bodyMedium">Visible</ThemedText>
            <ThemedText variant="caption" color={Colors.textSecondary}>
              {channelsText(detail)}
            </ThemedText>
          </View>
          {isSaving ? (
            <ActivityIndicator color={Colors.primary} style={styles.switchSpinner} />
          ) : (
            <VisibleSwitch
              label="Visible"
              value={detail.is_active}
              onChange={(value) => dispatch(setDetailVisibility(value))}
            />
          )}
        </View>
        <ThemedText variant="caption" color={Colors.textSecondary}>
          {detail.is_active ? "Publicado" : "Creado"} el {formatDate(detail.created_at)}
        </ThemedText>
      </View>

      {error && (
        <Pressable onPress={() => dispatch(clearDetailError())} accessibilityRole="button">
          <InfoBanner tone="error" message={error} />
        </Pressable>
      )}

      <View style={styles.card}>
        <SectionRow
          icon={FileText}
          title="Información general"
          subtitle={detail.sku ? `SKU ${detail.sku}` : "Nombre, descripción y SKU"}
          onPress={() => openSection("general")}
        />
        <SectionRow
          icon={Package}
          title={isSimple ? "Fotos y precio" : "Modelos"}
          subtitle={pricing}
          onPress={() => openSection("pricing")}
        />
        <SectionRow icon={Tag} title="Categoría" subtitle={category} onPress={() => openSection("category")} />
      </View>

      <Pressable
        onPress={() => openSection("more")}
        accessibilityRole="button"
        accessibilityLabel="Ver más secciones"
        hitSlop={8}
      >
        <ThemedText variant="caption" color={Colors.textSecondary} style={styles.footerNote}>
          {footer} · ↓ Más secciones
        </ThemedText>
      </Pressable>
    </ScreenLayout>
  );
};

export default ProductDetailScreen;

const cardShadow = {
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
  loading: {
    marginTop: spacing.xl,
  },
  block: {
    gap: spacing.sm,
  },
  photoFrame: {
    height: 144,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: Colors.selected,
  },
  photo: {
    height: 144,
  },
  noPhoto: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  badge: {
    alignSelf: "flex-start",
    height: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
    backgroundColor: Colors.selected,
  },
  lockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  card: {
    padding: spacing.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: radius.md,
    ...cardShadow,
  },
  visibleCard: {
    gap: spacing.xs,
  },
  row: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  switchSpinner: {
    width: 52,
  },
  footerNote: {
    textAlign: "center",
  },
});
