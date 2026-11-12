import { Colors, spacing } from "@/config/theme/theme";
import { clearAuthError, login } from "@/features/auth/authSlice";
import BrandHeader from "@/presentation/theme/components/BrandHeader";
import InfoBanner from "@/presentation/theme/components/InfoBanner";
import ScreenLayout from "@/presentation/theme/components/ScreenLayout";
import ThemedButton from "@/presentation/theme/components/ThemedButton";
import ThemedCheckbox from "@/presentation/theme/components/ThemedCheckbox";
import ThemedText from "@/presentation/theme/components/ThemedText";
import ThemedTextInput from "@/presentation/theme/components/ThemedTextInput";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { router } from "expo-router";
import { ScanFace } from "lucide-react-native";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginScreen = () => {
  const dispatch = useAppDispatch();
  const { status, error, remember: rememberedPreference } = useAppSelector((s) => s.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(rememberedPreference);
  const [submitted, setSubmitted] = useState(false);

  const isLoading = status === "loading";
  const emailIsValid = EMAIL_REGEX.test(email.trim());

  // El correo se valida mientras se escribe; los vacíos solo al intentar entrar.
  const emailError =
    email.length > 0 && !emailIsValid
      ? "Correo inválido"
      : submitted && email.length === 0
        ? "Campo requerido"
        : null;
  const passwordError = submitted && password.length === 0 ? "Campo requerido" : null;

  const onChange = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    if (error) dispatch(clearAuthError());
  };

  const onLogin = () => {
    setSubmitted(true);
    if (!emailIsValid || password.length === 0) return;
    dispatch(login({ email, password, remember }));
  };

  const onBiometric = () => {
    Alert.alert("Próximamente", "El acceso con Face ID / huella estará disponible pronto.");
  };

  return (
    <ScreenLayout
      footer={
        <>
          <ThemedButton
            title="Iniciar sesión"
            loadingTitle="Guardando…"
            loading={isLoading}
            onPress={onLogin}
          />
          <ThemedButton
            title="¿Olvidaste tu contraseña?"
            variant="text"
            onPress={() => !isLoading && router.push("/forgot-password")}
          />
          <ThemedButton
            title="Entrar con Face ID / huella"
            variant="outline"
            icon={ScanFace}
            onPress={() => !isLoading && onBiometric()}
          />
        </>
      }
    >
      <BrandHeader withBar />

      <View style={styles.intro}>
        <ThemedText variant="display">Bienvenido</ThemedText>
        <ThemedText color={Colors.textSecondary}>
          Administra tus productos desde tu celular.
        </ThemedText>
      </View>

      <ThemedTextInput
        label="Correo electrónico"
        placeholder="tucorreo@ejemplo.com"
        value={email}
        onChangeText={onChange(setEmail)}
        error={emailError}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        editable={!isLoading}
        returnKeyType="next"
      />

      <ThemedTextInput
        label="Contraseña"
        placeholder="Escribe tu contraseña"
        value={password}
        onChangeText={onChange(setPassword)}
        error={passwordError}
        isPassword
        autoCapitalize="none"
        autoComplete="password"
        textContentType="password"
        editable={!isLoading}
        returnKeyType="go"
        onSubmitEditing={onLogin}
      />

      <ThemedCheckbox label="Recordarme" checked={remember} onChange={setRemember} />

      {isLoading && <InfoBanner message="Estamos entrando a tu negocio…" />}
      {error && !isLoading && <InfoBanner tone="error" message={error} />}
    </ScreenLayout>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  intro: {
    gap: spacing.sm,
  },
});
