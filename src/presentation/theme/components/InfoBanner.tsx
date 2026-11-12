import { Colors, iconStroke, radius, spacing } from "@/config/theme/theme";
import { CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import ThemedText from "./ThemedText";

type Tone = "info" | "error" | "success" | "warning";

const tones: Record<Tone, { background: string; color: string; icon: LucideIcon }> = {
  info: { background: Colors.selected, color: Colors.primary, icon: Info },
  error: { background: Colors.dangerBackground, color: Colors.danger, icon: CircleAlert },
  success: { background: Colors.successBackground, color: Colors.successText, icon: CircleCheck },
  warning: { background: Colors.warningBackground, color: Colors.textPrimary, icon: TriangleAlert },
};

interface Props {
  message: string;
  tone?: Tone;
}

const InfoBanner = ({ message, tone = "info" }: Props) => {
  const { background, color, icon: Icon } = tones[tone];

  return (
    <View
      style={[styles.banner, { backgroundColor: background }]}
      accessibilityRole={tone === "error" ? "alert" : "text"}
      accessibilityLiveRegion="polite"
    >
      <Icon size={20} color={color} strokeWidth={iconStroke} absoluteStrokeWidth />
      <ThemedText variant="caption" color={color} style={styles.text}>
        {message}
      </ThemedText>
    </View>
  );
};

export default InfoBanner;

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.sm,
  },
  text: {
    flex: 1,
  },
});
