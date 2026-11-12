import SplashView from "@/presentation/screens/auth/SplashView";
import { useAppSelector } from "@/store/hooks";
import { selectIsInsideBusiness, selectIsLoggedIn } from "@/store/selectors";
import { Redirect } from "expo-router";

// Punto de entrada: decide la primera pantalla según el estado de la sesión.
export default function Index() {
  const status = useAppSelector((s) => s.auth.status);
  const blockReason = useAppSelector((s) => s.auth.blockReason);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const isInsideBusiness = useAppSelector(selectIsInsideBusiness);

  if (status === "checking") return <SplashView />;
  if (!isLoggedIn) return <Redirect href="/login" />;
  if (blockReason) return <Redirect href="/access-blocked" />;
  if (!isInsideBusiness) return <Redirect href="/select-business" />;
  return <Redirect href="/products" />;
}
