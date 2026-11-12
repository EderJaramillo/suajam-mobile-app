import { Colors, fonts, iconStroke, radius, spacing } from "@/config/theme/theme";
import { hasOffer, isOfferValid, type Offer } from "@/features/products/newProductSlice";
import { BadgePercent, ChevronRight } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import InfoBanner from "../InfoBanner";
import ThemedButton from "../ThemedButton";
import ThemedCheckbox from "../ThemedCheckbox";
import ThemedText from "../ThemedText";
import BottomSheet from "./BottomSheet";
import { useAppSelector } from "@/store/hooks";
import PricePreview, { money, withTaxes } from "./PricePreview";
import SheetCard from "./SheetCard";

const describeOffer = (offer: Offer) => {
  if (!hasOffer(offer)) return "Sin descuento · 0%";
  const channels = [offer.onStore && "Tienda en línea", offer.onPos && "Punto de venta"]
    .filter(Boolean)
    .join(" y ");
  return `${Number(offer.discount)}% · ${channels}`;
};

// Fase 3 / 33: "Refresco 600 ml: $25 + IEPS 8% + IVA 16% = $31.32. Elige un canal para
// aplicar el 10% después de impuestos." El descuento siempre va sobre el precio con impuestos.
function offerNote(
  name: string,
  price: number,
  taxes: { iva: number; ieps: number },
  offer: Offer,
  needsChannel: boolean,
) {
  const parts = [money(price)];
  if (taxes.ieps > 0) parts.push(`IEPS ${taxes.ieps}%`);
  if (taxes.iva > 0) parts.push(`IVA ${taxes.iva}%`);
  let text = `${name}: ${parts.join(" + ")}`;
  text += parts.length > 1 ? ` = ${money(withTaxes(price, taxes).total)}.` : " sin impuestos.";
  const discount = Number(offer.discount);
  if (needsChannel) text += ` Elige un canal para aplicar el ${discount}% después de impuestos.`;
  else if (hasOffer(offer)) text += ` El ${discount}% se aplica después de impuestos.`;
  return text;
}

// Fila "Oferta" que abre la hoja de descuento.
export const OfferRow = ({ offer, onPress }: { offer: Offer; onPress: () => void }) => (
  <Pressable onPress={onPress} style={styles.row} accessibilityRole="button" accessibilityLabel="Oferta">
    <BadgePercent size={24} color={Colors.primary} strokeWidth={iconStroke} absoluteStrokeWidth />
    <View style={styles.flex}>
      <ThemedText variant="bodyMedium">Oferta</ThemedText>
      <ThemedText variant="caption" color={Colors.textSecondary}>
        {describeOffer(offer)}
      </ThemedText>
    </View>
    <ChevronRight size={24} color={Colors.textSecondary} strokeWidth={iconStroke} absoluteStrokeWidth />
  </Pressable>
);

interface Props {
  visible: boolean;
  price: number;
  offer: Offer;
  onSave: (offer: Offer) => void;
  onClose: () => void;
}

// Fase 3 / 30: descuento por canal.
const OfferSheet = ({ visible, price, offer, onSave, onClose }: Props) => {
  const [draft, setDraft] = useState(offer);
  const { name, ivaRate, iepsRate } = useAppSelector((s) => s.newProduct);
  const taxes = { iva: Number(ivaRate), ieps: Number(iepsRate) };

  const discount = Number(draft.discount);
  const discountError =
    draft.discount !== "" && (discount < 0 || discount > 100) ? "Puedes aplicar de 0 a 100%." : null;
  const needsChannel = hasOffer(draft) && !draft.onStore && !draft.onPos;

  return (
    <BottomSheet visible={visible} onClose={onClose} onShow={() => setDraft(offer)}>
      <SheetCard title="Descuento por canal">
        <View style={styles.field}>
          <ThemedText variant="label">Descuento</ThemedText>
          <View style={[styles.input, discountError && styles.inputError]}>
            <TextInput
              style={styles.text}
              value={draft.discount}
              onChangeText={(text) => setDraft({ ...draft, discount: text.replace(/[^0-9]/g, "") })}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={Colors.textSecondary}
              accessibilityLabel="Descuento en porcentaje"
              maxLength={3}
            />
            <Text style={styles.suffix}>%</Text>
          </View>
          <ThemedText variant="caption" color={discountError ? Colors.danger : Colors.textSecondary}>
            {discountError ?? "Puedes aplicar de 0 a 100%."}
          </ThemedText>
        </View>

        <ThemedText variant="subtitle">Dónde aplicar</ThemedText>
        <ThemedCheckbox
          label="Tienda en línea / Catálogo"
          checked={draft.onStore}
          onChange={(onStore) => setDraft({ ...draft, onStore })}
        />
        <ThemedCheckbox
          label="Punto de venta"
          checked={draft.onPos}
          onChange={(onPos) => setDraft({ ...draft, onPos })}
        />
        {needsChannel && (
          <InfoBanner tone="error" message="Selecciona al menos un canal para aplicar el descuento." />
        )}

        {price > 0 && <PricePreview price={price} offer={draft} taxes={taxes} />}
        {price > 0 && (
          <ThemedText variant="caption" color={Colors.textSecondary}>
            {offerNote(name.trim(), price, taxes, draft, needsChannel)}
          </ThemedText>
        )}

        <ThemedButton
          title="Guardar oferta"
          disabled={!isOfferValid(draft) || discountError !== null}
          onPress={() => {
            onSave(draft);
            onClose();
          }}
        />
      </SheetCard>
    </BottomSheet>
  );
};

export default OfferSheet;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  field: {
    gap: spacing.xs,
  },
  input: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: radius.sm,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  text: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  suffix: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: Colors.textSecondary,
  },
});
