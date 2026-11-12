import { Colors, spacing } from "@/config/theme/theme";
import { logout } from "@/features/auth/authSlice";
import { chooseBusiness } from "@/features/business/businessSlice";
import AppBar from "@/presentation/theme/components/AppBar";
import BrandHeader from "@/presentation/theme/components/BrandHeader";
import BusinessCard from "@/presentation/theme/components/business/BusinessCard";
import ScreenLayout from "@/presentation/theme/components/ScreenLayout";
import ThemedButton from "@/presentation/theme/components/ThemedButton";
import ThemedText from "@/presentation/theme/components/ThemedText";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { StyleSheet, View } from "react-native";

// Solo se ve si el usuario tiene más de un negocio (con uno entra directo).
const SelectBusinessScreen = () => {
  const dispatch = useAppDispatch();
  const businesses = useAppSelector((s) => s.business.list);

  return (
    <ScreenLayout
      header={<AppBar title="Elige tu negocio" />}
      footer={
        <ThemedButton title="Cerrar sesión" variant="text" onPress={() => dispatch(logout())} />
      }
    >
      <BrandHeader />

      <View style={styles.intro}>
        <ThemedText variant="title">¿Qué negocio vas a administrar?</ThemedText>
        <ThemedText color={Colors.textSecondary}>Puedes cambiarlo después desde Cuenta.</ThemedText>
      </View>

      {businesses.map((business) => (
        <BusinessCard
          key={business.tenant_id}
          business={business}
          onPress={() => dispatch(chooseBusiness(business.tenant_slug))}
        />
      ))}
    </ScreenLayout>
  );
};

export default SelectBusinessScreen;

const styles = StyleSheet.create({
  intro: {
    gap: spacing.xs,
  },
});
