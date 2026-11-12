import { createAndApplyLabel } from "@/features/products/newProductSlice";
import InfoBanner from "@/presentation/theme/components/InfoBanner";
import NewProductLayout from "@/presentation/theme/components/new-product/NewProductLayout";
import ThemedButton from "@/presentation/theme/components/ThemedButton";
import ThemedText from "@/presentation/theme/components/ThemedText";
import ThemedTextInput from "@/presentation/theme/components/ThemedTextInput";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { router } from "expo-router";
import { useState } from "react";

// Fase 3 / 38: el filtro es el grupo (Material) y la etiqueta su valor (Algodón).
const CreateLabelScreen = () => {
  const dispatch = useAppDispatch();
  const isSaving = useAppSelector((s) => s.newProduct.isSaving);
  const [filterName, setFilterName] = useState("");
  const [labelName, setLabelName] = useState("");

  const canSave = filterName.trim().length > 0 && labelName.trim().length > 0;

  const onSave = async () => {
    const result = await dispatch(createAndApplyLabel({ filterName, labelName }));
    if (createAndApplyLabel.fulfilled.match(result)) router.back();
  };

  return (
    <NewProductLayout
      step={4}
      stepLabel="Publicación"
      footer={
        <ThemedButton
          title="Crear y aplicar"
          loading={isSaving}
          loadingTitle="Creando…"
          disabled={!canSave}
          onPress={onSave}
        />
      }
    >
      <ThemedText variant="title">Crear filtro o etiqueta</ThemedText>
      <ThemedTextInput
        label="Nombre del filtro *"
        placeholder="Ej. Material"
        value={filterName}
        onChangeText={setFilterName}
        maxLength={255}
      />
      <ThemedTextInput
        label="Nombre de la etiqueta *"
        placeholder="Ej. Algodón"
        value={labelName}
        onChangeText={setLabelName}
        maxLength={255}
      />
      <InfoBanner message="Tus clientes podrán encontrar el producto usando esta etiqueta." />
    </NewProductLayout>
  );
};

export default CreateLabelScreen;
