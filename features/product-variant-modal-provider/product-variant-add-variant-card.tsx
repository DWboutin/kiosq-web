import { useProductVariantModalContext } from "@/features/product-variant-modal-provider/product-variant-modal-provider";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusSquareIcon } from "@/components/ui/icons/plus-square-icon";
import { ButtonBrand } from "@/components/ui/button-brand";

export const ProductVariantAddVariantCard = () => {
  const t = useTranslations("AdminProductPage");
  const { handleCreateVariant } = useProductVariantModalContext();

  const handleAddVariant = () => {
    handleCreateVariant();
  };

  return (
    <Card
      className="flex flex-col overflow-hidden w-[240px] p-0 gap-4 border-dashed border-2 border-gray-300 hover:border-gray-400 cursor-pointer transition-colors"
      onClick={handleAddVariant}
    >
      <div className="relative h-[140px] flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <PlusSquareIcon className="w-12 h-12" />
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <CardHeader className="gap-2">
          <CardTitle className="text-lg font-semibold text-gray-600 text-center">
            {t("addVariant")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">{/* Empty content area */}</CardContent>
      </div>
      <CardFooter className="flex justify-center pt-0 pb-4">
        <ButtonBrand className="flex-1" onClick={handleAddVariant}>
          <PlusSquareIcon className="w-4 h-4" />
          {t("addVariant")}
        </ButtonBrand>
      </CardFooter>
    </Card>
  );
};
