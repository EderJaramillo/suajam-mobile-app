import { Stack } from "expo-router";

// Pantallas dentro del negocio activo (peticiones a la base de datos de la tienda).
export default function AppLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
