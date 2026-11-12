import { requestPasswordReset } from "@/features/auth/authSlice";
import AppBar from "@/presentation/theme/components/AppBar";
import EmptyState from "@/presentation/theme/components/EmptyState";
import InfoBanner from "@/presentation/theme/components/InfoBanner";
import ScreenLayout from "@/presentation/theme/components/ScreenLayout";
import ThemedButton from "@/presentation/theme/components/ThemedButton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { router, useLocalSearchParams } from "expo-router";
import { MailCheck } from "lucide-react-native";

const CheckEmailScreen = () => {
  const dispatch = useAppDispatch();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { status, error } = useAppSelector((s) => s.auth.passwordReset);

  const goToLogin = () => router.dismissTo("/login");

  return (
    <ScreenLayout
      header={<AppBar title="Recuperar contraseña" onBack={goToLogin} />}
      footer={
        <>
          <ThemedButton title="Volver a iniciar sesión" onPress={goToLogin} />
          <ThemedButton
            title="Enviar otro enlace"
            variant="text"
            loadingTitle="Enviando…"
            loading={status === "loading"}
            onPress={() => email && dispatch(requestPasswordReset(email))}
          />
        </>
      }
    >
      <EmptyState
        icon={MailCheck}
        title="Revisa tu correo"
        description={`Enviamos un enlace a ${email ?? "tu correo"}. Si no lo ves, revisa la carpeta de correo no deseado.`}
      />

      {status === "failed" && error ? (
        <InfoBanner tone="error" message={error} />
      ) : (
        <InfoBanner tone="success" message="Enlace enviado. Puedes cerrar esta pantalla." />
      )}
    </ScreenLayout>
  );
};

export default CheckEmailScreen;
