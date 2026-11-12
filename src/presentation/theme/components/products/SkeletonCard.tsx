import { Colors, radius, spacing } from "@/config/theme/theme";
import { StyleSheet, View } from "react-native";

const SkeletonCard = () => {
  return (
    <View style={styles.card} accessibilityElementsHidden>
      <View style={styles.photo} />
      <View style={styles.content}>
        <View style={styles.line} />
        <View style={[styles.line, styles.short]} />
      </View>
    </View>
  );
};

export default SkeletonCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    height: 82,
    backgroundColor: Colors.surface,
    borderRadius: radius.md,
  },
  photo: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: Colors.skeleton,
  },
  content: {
    flex: 1,
    gap: spacing.md,
  },
  line: {
    height: 12,
    borderRadius: 4,
    backgroundColor: Colors.skeleton,
  },
  short: {
    width: "45%",
  },
});
