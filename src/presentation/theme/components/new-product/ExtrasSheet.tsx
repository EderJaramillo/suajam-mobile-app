import { Colors, iconStroke, spacing } from "@/config/theme/theme";
import { useAppSelector } from "@/store/hooks";
import { router, type Href } from "expo-router";
import { ChevronRight, FileText, Percent, Tags, type LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import ThemedText from "../ThemedText";
import BottomSheet from "./BottomSheet";
import SheetCard from "./SheetCard";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const rate = (value: string) => (Number(value) === 0 ? "No aplica" : `${value}%`);
const count = (n: number, one: string, many: string, none: string) =>
  n === 0 ? none : `${n} ${n === 1 ? one : many}`;

// "Impuestos, canales y más": acceso a las pantallas 36, 37 y 39.
const ExtrasSheet = ({ visible, onClose }: Props) => {
  const { ivaRate, iepsRate, appliedLabels, documents } = useAppSelector((s) => s.newProduct);

  const options: { icon: LucideIcon; title: string; subtitle: string; href: Href }[] = [
    {
      icon: Percent,
      title: "Impuestos y canales",
      subtitle: `IVA ${rate(ivaRate)} · IEPS ${rate(iepsRate)}`,
      href: "/new-product/taxes",
    },
    {
      icon: Tags,
      title: "Filtros y etiquetas",
      subtitle: count(appliedLabels.length, "etiqueta", "etiquetas", "Ninguna"),
      href: "/new-product/labels",
    },
    {
      icon: FileText,
      title: "Documentos PDF",
      subtitle: count(documents.length, "documento", "documentos", "Ninguno"),
      href: "/new-product/documents",
    },
  ];

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <SheetCard title="Impuestos, canales y más">
        {options.map(({ icon: Icon, title, subtitle, href }) => (
          <Pressable
            key={title}
            style={styles.option}
            accessibilityRole="button"
            onPress={() => {
              onClose();
              router.push(href);
            }}
          >
            <Icon size={24} color={Colors.primary} strokeWidth={iconStroke} absoluteStrokeWidth />
            <View style={styles.text}>
              <ThemedText variant="bodyMedium">{title}</ThemedText>
              <ThemedText variant="caption" color={Colors.textSecondary}>
                {subtitle}
              </ThemedText>
            </View>
            <ChevronRight
              size={24}
              color={Colors.textSecondary}
              strokeWidth={iconStroke}
              absoluteStrokeWidth
            />
          </Pressable>
        ))}
      </SheetCard>
    </BottomSheet>
  );
};

export default ExtrasSheet;

const styles = StyleSheet.create({
  option: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  text: {
    flex: 1,
  },
});
