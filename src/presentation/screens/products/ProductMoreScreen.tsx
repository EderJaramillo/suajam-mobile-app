import { useLocalSearchParams } from "expo-router";
import EditLoader from "./sections/EditLoader";
import MoreSectionsScreen from "./sections/MoreSectionsScreen";

// Fase 4 / 04: "Más información" con todas las secciones.
const ProductMoreScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EditLoader productId={Number(id)}>{() => <MoreSectionsScreen />}</EditLoader>;
};

export default ProductMoreScreen;
