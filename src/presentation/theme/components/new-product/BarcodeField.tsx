import { Colors, iconStroke } from "@/config/theme/theme";
import type { BarcodeTarget } from "@/features/products/newProductSlice";
import { router } from "expo-router";
import { ScanBarcode } from "lucide-react-native";
import { Pressable } from "react-native";
import ThemedTextInput from "../ThemedTextInput";

interface Props {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  // A dónde deja el escáner el código leído.
  target: BarcodeTarget;
}

// "Código de barras (opcional)": se escribe o se escanea.
const BarcodeField = ({ value, onChange, error, target }: Props) => (
  <ThemedTextInput
    label="Código de barras (opcional)"
    placeholder="Escanear o escribir"
    value={value}
    onChangeText={onChange}
    error={error}
    maxLength={50}
    autoCapitalize="none"
    accessory={
      <Pressable
        onPress={() => router.push({ pathname: "/scanner", params: { mode: "capture", target } })}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Escanear código"
      >
        <ScanBarcode size={24} color={Colors.primary} strokeWidth={iconStroke} absoluteStrokeWidth />
      </Pressable>
    }
  />
);

export default BarcodeField;
