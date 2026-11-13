import { Colors, spacing } from "@/config/theme/theme";
import { logout } from "@/features/auth/authSlice";
import {
  archiveProduct,
  fetchCategories,
  fetchProducts,
  setProductVisibility,
  setSearch,
  setVisibilityFilter,
} from "@/features/products/productsSlice";
import { PRODUCT_LIMIT, type Product, type VisibilityFilter } from "@/features/products/productsTypes";
import { deleteDraftFile, loadDraftFile } from "@/features/products/draftStorage";
import {
  resetDraft,
  restoreDraft,
  resumeRoute,
  type SavedDraft,
} from "@/features/products/newProductSlice";
import AppBar from "@/presentation/theme/components/AppBar";
import BottomNav from "@/presentation/theme/components/BottomNav";
import ConfirmDialog from "@/presentation/theme/components/ConfirmDialog";
import EmptyState from "@/presentation/theme/components/EmptyState";
import InfoBanner from "@/presentation/theme/components/InfoBanner";
import FilterChip from "@/presentation/theme/components/products/FilterChip";
import ProductCard from "@/presentation/theme/components/products/ProductCard";
import ProductSearchBar from "@/presentation/theme/components/products/ProductSearchBar";
import QuotaBar from "@/presentation/theme/components/products/QuotaBar";
import SkeletonCard from "@/presentation/theme/components/products/SkeletonCard";
import ThemedButton from "@/presentation/theme/components/ThemedButton";
import ThemedText from "@/presentation/theme/components/ThemedText";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectActiveBusiness,
  selectFilteredProducts,
  selectHasActiveFilters,
} from "@/store/selectors";
import { router, type Href } from "expo-router";
import {
  Archive,
  CircleUserRound,
  FilePen,
  Eye,
  EyeOff,
  PackageOpen,
  Plus,
  SearchX,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const visibilityChips: { value: VisibilityFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "visible", label: "Visibles" },
  { value: "hidden", label: "Ocultos" },
];

const showComingSoon = (feature: string) => Alert.alert("Próximamente", `${feature} estará disponible pronto.`);

const ProductsScreen = () => {
  const dispatch = useAppDispatch();
  const business = useAppSelector(selectActiveBusiness);
  const products = useAppSelector(selectFilteredProducts);
  const hasActiveFilters = useAppSelector(selectHasActiveFilters);
  const { items, count, hasMore, status, isOffline, error, search, visibility } = useAppSelector(
    (s) => s.products,
  );

  const [openProductId, setOpenProductId] = useState<number | null>(null);
  const [productToArchive, setProductToArchive] = useState<Product | null>(null);
  const activeSlug = useAppSelector((s) => s.business.activeSlug);
  const draftInProgress = useAppSelector(
    (s) => s.newProduct.productId !== null && s.newProduct.mode === "create",
  );
  const isEditing = useAppSelector((s) => s.newProduct.mode === "edit");

  const startNewProduct = () => {
    if (isEditing) dispatch(resetDraft());
    router.push("/new-product");
  };
  // Borrador que quedó a medias la última vez (la app se cerró o se recargó).
  const [savedDraft, setSavedDraft] = useState<SavedDraft | null>(() =>
    activeSlug && !draftInProgress ? loadDraftFile<SavedDraft>(activeSlug) : null,
  );

  const resumeDraft = () => {
    if (!savedDraft) return;
    dispatch(restoreDraft(savedDraft));
    setSavedDraft(null);
    router.push(resumeRoute(savedDraft));
  };

  const discardDraft = () => {
    if (activeSlug) deleteDraftFile(activeSlug);
    setSavedDraft(null);
  };

  useEffect(() => {
    dispatch(fetchProducts("initial"));
    dispatch(fetchCategories());
  }, [dispatch]);

  const isLimitReached = count >= PRODUCT_LIMIT;
  const isFirstLoad = status === "loading" && items.length === 0;

  const onAccount = () => {
    Alert.alert("¿Cerrar sesión?", "Tendrás que volver a entrar con tu correo y contraseña.", [
      { text: "Volver", style: "cancel" },
      { text: "Cerrar sesión", style: "destructive", onPress: () => dispatch(logout()) },
    ]);
  };

  const onTabSelect = (tab: "products" | "gallery" | "account") => {
    if (tab === "gallery") showComingSoon("La galería");
    if (tab === "account") onAccount();
  };

  const onConfirmArchive = () => {
    if (productToArchive) dispatch(archiveProduct(productToArchive.id));
    setProductToArchive(null);
    setOpenProductId(null);
  };

  const renderItem = ({ item }: { item: Product }) => {
    const isOpen = item.id === openProductId;
    return (
      <View style={styles.item}>
        <ProductCard
          product={item}
          onToggleActions={() => setOpenProductId((id) => (id === item.id ? null : item.id))}
          onOpen={() => router.push(`/product/${item.id}` as Href)}
        />
        {isOpen &&
          (item.is_active ? (
            <View style={styles.actions}>
              <View style={styles.action}>
                <ThemedButton
                  title="Ocultar"
                  variant="outline"
                  icon={EyeOff}
                  disabled={isOffline}
                  onPress={() => dispatch(setProductVisibility({ id: item.id, isActive: false }))}
                />
              </View>
              <View style={styles.action}>
                <ThemedButton
                  title="Archivar"
                  variant="destructive"
                  icon={Archive}
                  disabled={isOffline}
                  onPress={() => setProductToArchive(item)}
                />
              </View>
            </View>
          ) : (
            <ThemedButton
              title="Mostrar producto"
              variant="outline"
              icon={Eye}
              disabled={isOffline}
              onPress={() => dispatch(setProductVisibility({ id: item.id, isActive: true }))}
            />
          ))}
      </View>
    );
  };

  const header = (
    <View style={styles.header}>
      <QuotaBar used={count} limit={PRODUCT_LIMIT} />
      <ProductSearchBar
        value={search}
        onChangeText={(text) => dispatch(setSearch(text))}
        onScan={() => router.push("/scanner")}
      />

      {isFirstLoad ? (
        <ThemedText variant="caption" color={Colors.textSecondary} style={styles.loadingText}>
          Cargando tus productos…
        </ThemedText>
      ) : openProductId !== null ? (
        <ThemedText variant="caption" color={Colors.textSecondary}>
          Desliza una tarjeta para ver sus acciones.
        </ThemedText>
      ) : (
        items.length > 0 && (
          <View style={styles.filters}>
            <View style={styles.chips}>
              {visibilityChips.map(({ value, label }) => (
                <FilterChip
                  key={value}
                  label={label}
                  selected={visibility === value}
                  onPress={() => dispatch(setVisibilityFilter(value))}
                />
              ))}
            </View>
            <View style={styles.chips}>
              <FilterChip
                label="Borradores / Incompletos"
                selected={visibility === "incomplete"}
                onPress={() => dispatch(setVisibilityFilter("incomplete"))}
              />
              <FilterChip
                label="Categoría ↓"
                onPress={() => router.push({ pathname: "/filter", params: { kind: "category" } })}
              />
              <FilterChip
                label="Tipo ↓"
                onPress={() => router.push({ pathname: "/filter", params: { kind: "type" } })}
              />
            </View>
          </View>
        )
      )}

      {error && (
        <InfoBanner tone={isOffline ? "warning" : "error"} message={error} />
      )}
      {isLimitReached && !isOffline && (
        <InfoBanner
          tone="warning"
          message={`Llegaste al límite de tu plan. ${count} de ${PRODUCT_LIMIT} productos usados.`}
        />
      )}
    </View>
  );

  const empty = isFirstLoad ? (
    <View style={styles.skeletons}>
      {[0, 1, 2, 3].map((key) => (
        <SkeletonCard key={key} />
      ))}
    </View>
  ) : hasActiveFilters && items.length > 0 ? (
    <EmptyState
      icon={SearchX}
      title="No encontramos productos"
      description="Prueba con otro nombre, SKU, modelo o variante. También puedes limpiar los filtros."
    />
  ) : status === "succeeded" ? (
    <View>
      <EmptyState
        icon={PackageOpen}
        title="Aún no tienes productos"
        description="Agrega tu primer producto en menos de 2 minutos."
      />
      <ThemedButton title="Agregar producto" onPress={startNewProduct} />
    </View>
  ) : undefined;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <AppBar
        title={business?.tenant_name ?? "Productos"}
        onAction={onAccount}
        actionIcon={CircleUserRound}
        actionLabel="Cuenta"
      />

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.content}
        data={products}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        ListFooterComponent={
          hasMore ? (
            <ThemedText
              variant="caption"
              color={Colors.textSecondary}
              align="center"
              style={styles.hint}
            >
              ↓ Desliza para ver más · Jala para actualizar
            </ThemedText>
          ) : undefined
        }
        keyboardShouldPersistTaps="handled"
        onEndReachedThreshold={0.3}
        onEndReached={() => {
          if (hasMore && status === "succeeded") dispatch(fetchProducts("more"));
        }}
        refreshControl={
          <RefreshControl
            refreshing={status === "refreshing"}
            onRefresh={() => {
              dispatch(fetchProducts("refresh"));
            }}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      />

      <View style={styles.footer}>
        <ThemedButton
          title="Agregar producto"
          icon={Plus}
          disabled={isLimitReached}
          onPress={startNewProduct}
        />
      </View>
      <BottomNav active="products" onSelect={onTabSelect} />

      <ConfirmDialog
        visible={savedDraft !== null}
        icon={FilePen}
        title="Tienes un producto sin terminar"
        description={`"${savedDraft?.name ?? ""}" se quedó a medias. Puedes seguir donde te quedaste.`}
        confirmLabel="Continuar"
        confirmVariant="primary"
        onConfirm={resumeDraft}
        onCancel={discardDraft}
        cancelLabel="Descartar"
      />
      <ConfirmDialog
        visible={productToArchive !== null}
        icon={Archive}
        title="¿Archivar producto?"
        description="Dejará de mostrarse en tienda y punto de venta. Podrás consultarlo después en el panel web."
        confirmLabel="Archivar producto"
        onConfirm={onConfirmArchive}
        onCancel={() => setProductToArchive(null)}
      />
    </SafeAreaView>
  );
};

export default ProductsScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    // Figma: 16 de margen + 15 de la línea vacía + 12 de separación.
    paddingTop: 43,
  },
  header: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  loadingText: {
    marginTop: 27,
  },
  filters: {
    gap: spacing.sm,
    marginTop: 27,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  item: {
    gap: spacing.md,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  action: {
    flex: 1,
  },
  separator: {
    height: spacing.md,
  },
  skeletons: {
    gap: spacing.md,
  },
  hint: {
    marginTop: spacing.md,
  },
  footer: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
});
