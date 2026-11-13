import { Colors, iconStroke } from "@/config/theme/theme";
import { clearBarcodeLookup, lookupBarcode } from "@/features/products/productsSlice";
import AppBar from "@/presentation/theme/components/AppBar";
import InfoBanner from "@/presentation/theme/components/InfoBanner";
import ProductCard from "@/presentation/theme/components/products/ProductCard";
import ScreenLayout from "@/presentation/theme/components/ScreenLayout";
import ThemedButton from "@/presentation/theme/components/ThemedButton";
import ThemedTextInput from "@/presentation/theme/components/ThemedTextInput";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { router, useLocalSearchParams, type Href } from "expo-router";
import { ScanBarcode } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable } from "react-native";

// Fase 2 / 12. Las pantallas 13 y 14 están fuera del alcance: "no encontrado"
// es solo un aviso y el código también se puede escribir en este mismo campo.
const BarcodeResultScreen = () => {
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{ code?: string }>();
  const { status, product, error } = useAppSelector((s) => s.products.barcodeLookup);
  const [code, setCode] = useState(params.code ?? "");

  useEffect(() => {
    if (params.code) dispatch(lookupBarcode(params.code.trim()));
    return () => {
      dispatch(clearBarcodeLookup());
    };
  }, [dispatch, params.code]);

  const onSearch = () => {
    if (code.trim()) dispatch(lookupBarcode(code.trim()));
  };

  const onViewProduct = () => {
    if (product) router.push(`/product/${product.id}` as Href);
  };

  return (
    <ScreenLayout
      header={<AppBar title="Código de barras" onBack={() => router.back()} />}
      footer={
        <ThemedButton
          title={status === "found" ? "Ver producto" : "Buscar código"}
          loading={status === "loading"}
          loadingTitle="Buscando…"
          disabled={status !== "found" && !code.trim()}
          onPress={status === "found" ? onViewProduct : onSearch}
        />
      }
    >
      <ThemedTextInput
        label="Código de barras"
        placeholder="Escribe el código"
        value={code}
        onChangeText={(text) => {
          setCode(text);
          if (status !== "idle") dispatch(clearBarcodeLookup());
        }}
        keyboardType="number-pad"
        returnKeyType="search"
        onSubmitEditing={onSearch}
        accessory={
          <Pressable
            onPress={() => router.replace("/scanner")}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Escanear código"
          >
            <ScanBarcode
              size={24}
              color={Colors.primary}
              strokeWidth={iconStroke}
              absoluteStrokeWidth
            />
          </Pressable>
        }
      />

      {status === "found" && product && (
        <>
          <InfoBanner tone="success" message="Encontramos este código en tu negocio." />
          <ProductCard product={product} onToggleActions={onViewProduct} />
        </>
      )}
      {status === "notFound" && (
        <InfoBanner tone="warning" message="No encontramos este código en tu negocio." />
      )}
      {status === "failed" && error && <InfoBanner tone="error" message={error} />}
    </ScreenLayout>
  );
};

export default BarcodeResultScreen;
