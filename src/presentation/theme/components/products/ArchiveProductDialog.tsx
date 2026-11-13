import { archiveProduct } from "@/features/products/productsSlice";
import { useAppDispatch } from "@/store/hooks";
import { router } from "expo-router";
import { Archive } from "lucide-react-native";
import { useState } from "react";
import ConfirmDialog from "../ConfirmDialog";

interface Props {
  productId: number;
  visible: boolean;
  onClose: () => void;
}

// Fase 4 / 12: confirmar antes de archivar; al archivar se vuelve a la lista.
const ArchiveProductDialog = ({ productId, visible, onClose }: Props) => {
  const dispatch = useAppDispatch();
  const [isArchiving, setIsArchiving] = useState(false);

  const onConfirm = async () => {
    setIsArchiving(true);
    const result = await dispatch(archiveProduct(productId));
    setIsArchiving(false);
    onClose();
    if (archiveProduct.fulfilled.match(result)) router.dismissTo("/products");
  };

  return (
    <ConfirmDialog
      visible={visible}
      icon={Archive}
      title="¿Archivar producto?"
      description="Dejará de mostrarse en tienda y punto de venta."
      confirmLabel="Archivar producto"
      loading={isArchiving}
      onConfirm={onConfirm}
      onCancel={onClose}
    />
  );
};

export default ArchiveProductDialog;
