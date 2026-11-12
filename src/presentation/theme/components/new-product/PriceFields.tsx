import { spacing } from "@/config/theme/theme";
import type { Offer } from "@/features/products/newProductSlice";
import { StyleSheet, View } from "react-native";
import InfoBanner from "../InfoBanner";
import AmountField from "./AmountField";
import PricePreview from "./PricePreview";

interface Props {
  cost: string;
  price: string;
  onChange: (changes: { cost?: string; price?: string }) => void;
  showPreview?: boolean;
  offer?: Offer;
  costLabel?: string;
  priceLabel?: string;
}

// Costo + precio, margen y "Tu cliente paga" (se repite en Simple, modelos y variantes).
const PriceFields = ({
  cost,
  price,
  onChange,
  showPreview = true,
  offer,
  costLabel = "Costo *",
  priceLabel = "Precio de venta *",
}: Props) => {
  const costValue = Number(cost);
  const priceValue = Number(price);
  const hasAmounts = cost !== "" && price !== "" && priceValue > 0;
  const margin = priceValue - costValue;

  return (
    <>
      <View style={styles.row}>
        <AmountField label={costLabel} value={cost} onChange={(value) => onChange({ cost: value })} />
        <AmountField label={priceLabel} value={price} onChange={(value) => onChange({ price: value })} />
      </View>
      {hasAmounts && (
        <InfoBanner
          tone={margin >= 0 ? "success" : "warning"}
          message={`Tu margen: ${margin < 0 ? "-" : ""}$${Math.abs(margin)} · antes de impuestos`}
        />
      )}
      {hasAmounts && showPreview && <PricePreview price={priceValue} offer={offer} />}
    </>
  );
};

export default PriceFields;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
});
