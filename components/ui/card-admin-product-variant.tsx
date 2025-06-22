import { deleteProductVariant } from "@/actions/delete-product-variant";
import { Badge } from "@/components/ui/badge";
import { ButtonBrand } from "@/components/ui/button-brand";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { EditPencilIcon } from "@/components/ui/icons/edit-pencil-icon";
import { ButtonWithConfirmationModal } from "@/features/button-with-confirmation-modal/button-with-confirmation-modal";
import { useProductVariantModalContext } from "@/features/product-variant-modal-provider/product-variant-modal-provider";
import { cacheKeys } from "@/utils/cache-keys";
import { useQueryClient } from "@tanstack/react-query";
import { TrashIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useParams } from "next/navigation";

export type ProductVariantValues = {
  id: string;
  quantity: number;
  unit: string;
  price: number;
  imageUrl?: string | null;
  isDefault?: boolean;
};

type CardAdminProductVariantProps = ProductVariantValues;

export const CardAdminProductVariant = ({
  id,
  quantity,
  unit,
  price,
  imageUrl,
  isDefault,
}: CardAdminProductVariantProps) => {
  const t = useTranslations("ProductVariantForm");
  const title = `${quantity} ${unit}`;
  const params = useParams();
  const productId = params.productId as string;
  const queryClient = useQueryClient();
  const { handleSetVariantValues } = useProductVariantModalContext();

  const handleEditVariant = () => {
    handleSetVariantValues({ id, quantity, unit, price, imageUrl, isDefault });
  };

  const handleDeleteVariant = async () => {
    await deleteProductVariant({ variantId: id, productId });
    await queryClient.invalidateQueries({
      queryKey: cacheKeys.currentUserProductById(productId).queryKey,
    });
  };

  return (
    <Card className="flex flex-col overflow-hidden w-[240px] p-0 gap-4">
      <div className="relative">
        <Image
          src={imageUrl || "/placeholders/240x140.jpg"}
          alt={`${title} variant`}
          width={240}
          height={140}
          className="object-cover"
        />
        {isDefault && (
          <Badge className="absolute top-2 left-2 bg-brand-medium text-white">
            {t("principalVariant")}
          </Badge>
        )}
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <CardHeader className="gap-2">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="flex justify-end items-center">
            <span className="text-md font-semibold">{price.toFixed(2)} $</span>
          </div>
        </CardContent>
      </div>
      <CardFooter className="flex flex-col gap-2 justify-end pt-0 pb-4">
        <ButtonBrand className="w-full" onClick={handleEditVariant}>
          <EditPencilIcon />
          {t("editVariant")}
        </ButtonBrand>
        {!isDefault && (
          <ButtonWithConfirmationModal
            title={t("deleteModalTitle")}
            description={t("deleteModalDescription")}
            confirmLabel={t("deleteModalButton")}
            cancelLabel={t("cancelModalButton")}
            action={handleDeleteVariant}
          >
            <ButtonBrand className="w-full" variant="destructive">
              <TrashIcon />
              {t("deleteVariant")}
            </ButtonBrand>
          </ButtonWithConfirmationModal>
        )}
      </CardFooter>
    </Card>
  );
};
