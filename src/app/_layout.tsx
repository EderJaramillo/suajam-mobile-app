import { restoreSession } from "@/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIsInsideBusiness, selectIsLoggedIn } from "@/store/selectors";
import { store } from "@/store/store";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Provider } from "react-redux";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const fontsReady = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (fontsReady) SplashScreen.hide();
  }, [fontsReady]);

  if (!fontsReady) return null;

  return (
    <Provider store={store}>
      <StatusBar style="dark" />
      <RootNavigator />
    </Provider>
  );
}

// Las pantallas se agrupan según la sesión. Si un grupo deja de estar permitido
// (por ejemplo, al iniciar o cerrar sesión), Expo Router regresa a "index",
// que decide a dónde mandar al usuario.
function RootNavigator() {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const isInsideBusiness = useAppSelector(selectIsInsideBusiness);

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />

      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="login" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="check-email" />
      </Stack.Protected>

      <Stack.Protected guard={isLoggedIn && !isInsideBusiness}>
        <Stack.Screen name="select-business" />
        <Stack.Screen name="access-blocked" />
      </Stack.Protected>

      <Stack.Protected guard={isInsideBusiness}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}
