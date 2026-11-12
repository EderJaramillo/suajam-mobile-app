import { Colors, iconStroke, radius, spacing, touchTarget } from "@/config/theme/theme";
import ThemedButton from "@/presentation/theme/components/ThemedButton";
import ThemedText from "@/presentation/theme/components/ThemedText";
import { applyScannedBarcode, type BarcodeTarget } from "@/features/products/newProductSlice";
import { useAppDispatch } from "@/store/hooks";
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Keyboard, Zap, ZapOff } from "lucide-react-native";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ScannerScreen = () => {
  const dispatch = useAppDispatch();
  // Al crear un producto solo se captura el código, no se busca.
  const { mode, target = "simple" } = useLocalSearchParams<{
    mode?: "capture";
    target?: BarcodeTarget;
  }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [isTorchOn, setIsTorchOn] = useState(false);
  // La cámara dispara el evento varias veces por segundo: solo se usa la primera lectura.
  const hasScanned = useRef(false);

  const onBarcodeScanned = ({ data }: BarcodeScanningResult) => {
    if (hasScanned.current) return;
    hasScanned.current = true;
    if (mode === "capture") {
      dispatch(applyScannedBarcode({ target, code: data }));
      router.back();
      return;
    }
    router.replace({ pathname: "/barcode-result", params: { code: data } });
  };

  const TorchIcon = isTorchOn ? ZapOff : Zap;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar style="light" />

      <View style={styles.bar}>
        <Pressable
          onPress={() => router.back()}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <ArrowLeft size={24} color={Colors.onPrimary} strokeWidth={iconStroke} absoluteStrokeWidth />
        </Pressable>
        <ThemedText variant="subtitle" color={Colors.onPrimary} style={styles.title}>
          Escanear código
        </ThemedText>
        <Pressable
          onPress={() => setIsTorchOn((on) => !on)}
          style={styles.iconButton}
          accessibilityRole="switch"
          accessibilityLabel="Flash"
          accessibilityState={{ checked: isTorchOn }}
        >
          <TorchIcon size={24} color={Colors.onPrimary} strokeWidth={iconStroke} absoluteStrokeWidth />
        </Pressable>
      </View>

      <View style={styles.content}>
        <ThemedText color={Colors.onPrimary} align="center">
          Coloca el código dentro del recuadro.
        </ThemedText>

        <View style={styles.cameraArea}>
          <View style={styles.camera}>
            {permission?.granted ? (
              <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                enableTorch={isTorchOn}
                barcodeScannerSettings={{
                  barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128", "code39"],
                }}
                onBarcodeScanned={onBarcodeScanned}
              />
            ) : (
              <View style={styles.permission}>
                <ThemedText color={Colors.textSecondary} align="center">
                  Necesitamos tu cámara para leer el código de barras.
                </ThemedText>
                <ThemedButton
                  title="Permitir cámara"
                  variant="outline"
                  onPress={requestPermission}
                />
              </View>
            )}
          </View>
          {permission?.granted && (
            <>
              <View style={styles.frame} />
              <View style={styles.line} />
            </>
          )}
        </View>

        <ThemedText variant="caption" color={Colors.onPrimary} align="center">
          Flash disponible · Apunta al código de barras
        </ThemedText>
      </View>

      <View style={styles.footer}>
        <ThemedButton
          title="Ingresar código manualmente"
          variant="outline"
          icon={Keyboard}
          onPress={() => router.replace("/barcode-result")}
        />
      </View>
    </SafeAreaView>
  );
};

export default ScannerScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.scannerBackground,
  },
  bar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  iconButton: {
    width: touchTarget,
    height: touchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    // Figma: 16 de margen + 15 de la línea vacía + 12 de separación.
    paddingTop: 43,
    gap: spacing.md,
  },
  cameraArea: {
    height: 414,
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    width: 320,
    height: 320,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: Colors.surface,
  },
  permission: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.lg,
  },
  frame: {
    position: "absolute",
    top: 125,
    width: 326,
    height: 160,
    borderWidth: 3,
    borderColor: Colors.onPrimary,
    borderRadius: radius.lg,
  },
  line: {
    position: "absolute",
    top: 204,
    width: 302,
    height: 2,
    backgroundColor: Colors.secondary,
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
