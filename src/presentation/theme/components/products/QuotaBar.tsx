import { Colors, fonts, spacing } from "@/config/theme/theme";
import { StyleSheet, Text, View } from "react-native";
import ThemedText from "../ThemedText";

interface Props {
  used: number;
  limit: number;
}

const QuotaBar = ({ used, limit }: Props) => {
  const percent = Math.min(used / limit, 1) * 100;
  const isFull = used >= limit;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <ThemedText variant="caption" color={Colors.textSecondary} style={styles.label}>
          Productos usados
        </ThemedText>
        <Text style={styles.count}>
          {used}/{limit}
        </Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${percent}%`, backgroundColor: isFull ? Colors.danger : Colors.primary },
          ]}
        />
      </View>
    </View>
  );
};

export default QuotaBar;

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  label: {
    flex: 1,
  },
  count: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: Colors.primary,
  },
  track: {
    height: 4,
    borderRadius: 4,
    backgroundColor: Colors.border,
    overflow: "hidden",
  },
  fill: {
    height: 4,
    borderRadius: 4,
  },
});
