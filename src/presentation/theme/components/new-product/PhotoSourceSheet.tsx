import type { DraftPhoto } from "@/features/products/newProductSlice";
import { useState } from "react";
import BottomSheet from "./BottomSheet";
import PhotoSourceContent from "./PhotoSourceContent";

interface Props {
  visible: boolean;
  modelName: string;
  remaining: number;
  onAdd: (photos: DraftPhoto[]) => void;
  onClose: () => void;
}

// Fase 3 / 16-18 como hoja inferior.
const PhotoSourceSheet = ({ visible, modelName, remaining, onAdd, onClose }: Props) => {
  // Cambiar la llave reinicia el contenido en "menú" cada vez que se abre.
  const [openCount, setOpenCount] = useState(0);

  return (
    <BottomSheet visible={visible} onClose={onClose} onShow={() => setOpenCount((n) => n + 1)}>
      <PhotoSourceContent
        key={openCount}
        modelName={modelName}
        remaining={remaining}
        onAdd={onAdd}
        onDone={onClose}
      />
    </BottomSheet>
  );
};

export default PhotoSourceSheet;
