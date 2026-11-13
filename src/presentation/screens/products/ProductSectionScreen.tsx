import { SIMPLE_TYPE } from "@/features/products/productsTypes";
import DocumentsScreen from "@/presentation/screens/new-product/DocumentsScreen";
import LabelsScreen from "@/presentation/screens/new-product/LabelsScreen";
import ModelsScreen from "@/presentation/screens/new-product/ModelsScreen";
import AppBar from "@/presentation/theme/components/AppBar";
import InfoBanner from "@/presentation/theme/components/InfoBanner";
import ScreenLayout from "@/presentation/theme/components/ScreenLayout";
import { useAppSelector } from "@/store/hooks";
import { router, useLocalSearchParams } from "expo-router";
import ChannelsSectionScreen from "./sections/ChannelsSectionScreen";
import EditLoader from "./sections/EditLoader";
import GeneralSectionScreen from "./sections/GeneralSectionScreen";
import SimplePricingSectionScreen from "./sections/SimplePricingSectionScreen";
import TaxesSectionScreen from "./sections/TaxesSectionScreen";

// Fase 4 / 05–09: cada sección reutiliza las pantallas y guardados del alta.
const Section = ({ section }: { section: string }) => {
  const typeId = useAppSelector((s) => s.newProduct.typeId);
  switch (section) {
    case "general":
      return <GeneralSectionScreen />;
    case "pricing":
      return typeId === SIMPLE_TYPE ? <SimplePricingSectionScreen /> : <ModelsScreen />;
    case "taxes":
      return <TaxesSectionScreen />;
    case "channels":
      return <ChannelsSectionScreen />;
    case "labels":
      return <LabelsScreen />;
    case "documents":
      return <DocumentsScreen />;
    default:
      return (
        <ScreenLayout header={<AppBar title="Detalle del producto" onBack={() => router.back()} />}>
          <InfoBanner tone="error" message="Esta sección no existe." />
        </ScreenLayout>
      );
  }
};

const ProductSectionScreen = () => {
  const { id, section } = useLocalSearchParams<{ id: string; section: string }>();
  return <EditLoader productId={Number(id)}>{() => <Section section={section} />}</EditLoader>;
};

export default ProductSectionScreen;
