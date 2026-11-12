import { logout } from "@/features/auth/authSlice";
import type { BlockReason } from "@/features/auth/authTypes";
import AppBar from "@/presentation/theme/components/AppBar";
import BrandHeader from "@/presentation/theme/components/BrandHeader";
import EmptyState from "@/presentation/theme/components/EmptyState";
import ScreenLayout from "@/presentation/theme/components/ScreenLayout";
import ThemedButton from "@/presentation/theme/components/ThemedButton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { ShieldAlert } from "lucide-react-native";

const messages: Record<BlockReason, { title: string; description: string }> = {
  "no-panel-access": {
    title: "Tu usuario no tiene acceso al panel administrativo",
    description:
      "Pídele al dueño de tu negocio que revise tu acceso. Después puedes intentar de nuevo.",
  },
  "no-business": {
    title: "Tu usuario no tiene ningún negocio asignado",
    description:
      "Pídele al dueño de tu negocio que revise tu acceso. Después puedes intentar de nuevo.",
  },
};

// "Volver" cierra la sesión: al quedar sin sesión, el layout regresa al login.
const AccessBlockedScreen = () => {
  const dispatch = useAppDispatch();
  const reason = useAppSelector((s) => s.auth.blockReason) ?? "no-business";
  const { title, description } = messages[reason];

  const goBack = () => dispatch(logout());

  return (
    <ScreenLayout
      header={<AppBar title="Acceso a Suajam" onBack={goBack} />}
      footer={<ThemedButton title="Volver" onPress={goBack} />}
    >
      <BrandHeader />
      <EmptyState icon={ShieldAlert} title={title} description={description} />
    </ScreenLayout>
  );
};

export default AccessBlockedScreen;
