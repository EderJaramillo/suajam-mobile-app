import { Colors, typography } from "@/config/theme/theme";
import { Text, type TextProps } from "react-native";

type Variant = keyof typeof typography;

interface Props extends TextProps {
  variant?: Variant;
  color?: string;
  align?: "left" | "center" | "right";
}

const ThemedText = ({
  variant = "body",
  color = Colors.textPrimary,
  align,
  style,
  ...rest
}: Props) => {
  return <Text style={[typography[variant], { color, textAlign: align }, style]} {...rest} />;
};

export default ThemedText;
