import { Locales } from "@/types/app";
import {
  ProductVariantWithPrices,
  ProductWithVariantsPricesAndProfile,
} from "@/utils/factories/product-factory";
import { useLocale } from "next-intl";
import Image from "next/image";

interface ReservationButtonModalContentProps {
  product: ProductWithVariantsPricesAndProfile;
  variant: ProductVariantWithPrices;
}

export const ReservationButtonModalContent = ({
  product,
  variant,
}: ReservationButtonModalContentProps) => {
  const locale = useLocale() as Locales;

  return (
    <div className="flex flex-row gap-4">
      <div className="flex flex-col gap-4">
        <Image
          src={variant.imageUrl || "/placeholders/240x140.jpg"}
          alt={product.nameTranslations[locale]}
          width={120}
          height={70}
          className="rounded-lg"
        />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-md font-bold">{product.nameTranslations[locale]}</h3>
        <p className="text-sm text-neutral-darker">{product.descriptionTranslations[locale]}</p>
      </div>
    </div>
  );
};
