import { requestPasswordReset, resetPasswordReset } from "@/features/auth/authSlice";
import AppBar from "@/presentation/theme/components/AppBar";
import EmptyState from "@/presentation/theme/components/EmptyState";
import InfoBanner from "@/presentation/theme/components/InfoBanner";
import ScreenLayout from "@/presentation/theme/components/ScreenLayout";
import ThemedButton from "@/presentation/theme/components/ThemedButton";
import ThemedTextInput from "@/presentation/theme/components/ThemedTextInput";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { router } from "expo-router";
import { KeyRound } from "lucide-react-native";
import { useEffect, useState } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPasswordScreen = () => {
  const dispatch = useAppDispatch();
  const { status, error, email: sentTo } = useAppSelector((s) => s.auth.passwordReset);

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isLoading = status === "loading";
  const emailIsValid = EMAIL_REGEX.test(email.trim());
  const emailError =
    email.length > 0 && !emailIsValid
      ? "Correo inválido"
      : submitted && email.length === 0
        ? "Campo requerido"
        : null;

  useEffect(() => {
    if (status === "succeeded" && sentTo) {
      router.replace({ pathname: "/check-email", params: { email: sentTo } });
    }
  }, [status, sentTo]);

  // Al salir de la pantalla se limpia el estado para la próxima vez.
  useEffect(() => {
    return () => {
      dispatch(resetPasswordReset());
    };
  }, [dispatch]);

  const onSend = () => {
    setSubmitted(true);
    if (!emailIsValid) return;
    dispatch(requestPasswordReset(email));
  };

  return (
    <ScreenLayout
      header={<AppBar title="Recuperar contraseña" onBack={() => router.back()} />}
      footer={
        <ThemedButton
          title="Enviar enlace"
          loadingTitle="Enviando…"
          loading={isLoading}
          onPress={onSend}
        />
      }
    >
      <EmptyState
        icon={KeyRound}
        title="Recupera tu acceso"
        description="Escribe el correo de tu cuenta. Te enviaremos un enlace para crear una nueva contraseña."
      />

      <ThemedTextInput
        label="Correo electrónico"
        placeholder="tucorreo@ejemplo.com"
        value={email}
        onChangeText={setEmail}
        error={emailError}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        editable={!isLoading}
        returnKeyType="send"
        onSubmitEditing={onSend}
      />

      {error ? (
        <InfoBanner tone="error" message={error} />
      ) : (
        <InfoBanner message="El enlace es personal. No lo compartas con nadie." />
      )}
    </ScreenLayout>
  );
};

export default ForgotPasswordScreen;
