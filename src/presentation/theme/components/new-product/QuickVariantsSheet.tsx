import { Colors, fonts, iconStroke, radius, spacing, touchTarget } from "@/config/theme/theme";
import { addEditingVariants, hasPrice } from "@/features/products/newProductSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Check } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import InfoBanner from "../InfoBanner";
import ThemedButton from "../ThemedButton";
import ThemedText from "../ThemedText";
import ThemedTextInput from "../ThemedTextInput";
import BottomSheet from "./BottomSheet";
import PriceFields from "./PriceFields";
import SheetCard from "./SheetCard";

// Opciones rápidas del Figma: tallas, tamaños y capacidades.
const PRESET_GROUPS = [
  ["CH", "M", "G", "XG"],
  ["Chico", "Mediano", "Grande"],
  ["250 ml", "500 ml", "1 L"],
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

// Fase 3 / 26: crear varias variantes de una vez con costo y precio común.
const QuickVariantsSheet = ({ visible, onClose }: Props) => {
  const dispatch = useAppDispatch();
  const existing = useAppSelector((s) => s.newProduct.editingModel?.variants ?? []);

  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState<string[]>([]);
  const [otherName, setOtherName] = useState("");
  const [cost, setCost] = useState("");
  const [price, setPrice] = useState("");

  const existingNames = new Set(existing.map((v) => v.name.toLowerCase()));
  const toCreate = selected.filter((name) => !existingNames.has(name.toLowerCase()));
  const canApply = toCreate.length > 0 && hasPrice({ cost, price });

  const onShow = () => {
    setSelected([]);
    setCustom([]);
    setOtherName("");
    setCost("");
    setPrice("");
  };

  const toggle = (name: string) =>
    setSelected((current) =>
      current.includes(name) ? current.filter((n) => n !== name) : [...current, name],
    );

  const addOther = () => {
    const name = otherName.trim();
    if (!name) return;
    if (!custom.includes(name)) setCustom([...custom, name]);
    if (!selected.includes(name)) setSelected([...selected, name]);
    setOtherName("");
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} onShow={onShow}>
      <SheetCard title="Agregar variantes rápido">
        <ThemedText variant="caption" color={Colors.textSecondary}>
          Selecciona varias opciones. Podrás ajustar cada precio después.
        </ThemedText>

        {[...PRESET_GROUPS, custom].filter((group) => group.length > 0).map((group) => (
          <View key={group.join()} style={styles.chips}>
            {group.map((name) => {
              const isSelected = selected.includes(name);
              const isExisting = existingNames.has(name.toLowerCase());
              return (
                <Pressable
                  key={name}
                  onPress={() => toggle(name)}
                  disabled={isExisting}
                  style={[styles.chip, isSelected && styles.chipSelected, isExisting && styles.chipExisting]}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected, disabled: isExisting }}
                  accessibilityLabel={isExisting ? `${name}, ya existe` : name}
                >
                  <Text style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>{name}</Text>
                  {/* La palomita siempre ocupa su lugar para que la opción no cambie de ancho. */}
                  <Check
                    size={14}
                    color={isSelected ? Colors.primary : isExisting ? Colors.textSecondary : "transparent"}
                    strokeWidth={iconStroke}
                    absoluteStrokeWidth
                  />
                </Pressable>
              );
            })}
          </View>
        ))}

        <ThemedTextInput
          label="O escribe otra opción"
          placeholder="Ej. Extra grande"
          value={otherName}
          onChangeText={setOtherName}
          onSubmitEditing={addOther}
          onBlur={addOther}
          returnKeyType="done"
          maxLength={100}
        />

        <PriceFields
          cost={cost}
          price={price}
          showPreview={false}
          costLabel="Costo común *"
          priceLabel="Precio común *"
          onChange={(changes) => {
            if (changes.cost !== undefined) setCost(changes.cost);
            if (changes.price !== undefined) setPrice(changes.price);
          }}
        />

        {/* Siempre visible: si apareciera al elegir, la hoja se movería bajo el dedo. */}
        <InfoBanner
          message={
            toCreate.length > 0
              ? `Se crearán ${toCreate.length} ${toCreate.length === 1 ? "variante visible" : "variantes visibles"}. Puedes ajustar cada precio después.`
              : "Elige una o más opciones para crear sus variantes."
          }
        />

        <ThemedButton
          title="Aplicar a todas"
          disabled={!canApply}
          onPress={() => {
            dispatch(addEditingVariants({ names: toCreate, cost, price }));
            onClose();
          }}
        />
      </SheetCard>
    </BottomSheet>
  );
};

export default QuickVariantsSheet;

const styles = StyleSheet.create({
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    height: touchTarget,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: radius.sm,
  },
  chipSelected: {
    backgroundColor: Colors.selected,
    borderColor: Colors.primary,
  },
  chipExisting: {
    opacity: 0.5,
  },
  chipLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  chipLabelSelected: {
    color: Colors.primary,
  },
});
