import { Colors, radius, spacing } from "@/config/theme/theme";
import { NO_OFFER, hasOffer, type Offer } from "@/features/products/newProductSlice";
import { StyleSheet, View } from "react-native";
import ThemedText from "../ThemedText";

interface Props {
  price: number;
  offer?: Offer;
  taxes?: Taxes;
}

// Porcentajes. El IEPS se cobra sobre el precio y el IVA sobre precio + IEPS.
export interface Taxes {
  iva: number;
  ieps: number;
}

export const money = (n: number) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`;

export function withTaxes(price: number, taxes?: Taxes) {
  const ieps = taxes ? (price * taxes.ieps) / 100 : 0;
  const iva = taxes ? ((price + ieps) * taxes.iva) / 100 : 0;
  return { ieps, iva, total: price + ieps + iva };
}

// El descuento solo cambia el precio de los canales donde se aplica.
export function channelPrices(base: number, offer: Offer = NO_OFFER, taxes?: Taxes) {
  const price = withTaxes(base, taxes).total;
  const factor = hasOffer(offer) ? 1 - Math.min(Number(offer.discount), 100) / 100 : 1;
  return [
    { label: "Tienda en línea", amount: offer.onStore ? price * factor : price },
    { label: "Punto de venta", amount: offer.onPos ? price * factor : price },
  ];
}

// "Tu cliente paga": precio final por canal.
const PricePreview = ({ price, offer, taxes }: Props) => {
  return (
    <View style={styles.card}>
      <ThemedText variant="label" color={Colors.primary}>
        TU CLIENTE PAGA
      </ThemedText>
      <View style={styles.row}>
        {channelPrices(price, offer, taxes).map(({ label, amount }) => (
          <View key={label} style={styles.channel}>
            <ThemedText variant="caption">{label}</ThemedText>
            <ThemedText variant="title">${amount.toFixed(2)}</ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
};

export default PricePreview;

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: Colors.selected,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: radius.md,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  channel: {
    flex: 1,
    gap: spacing.xs,
  },
});
