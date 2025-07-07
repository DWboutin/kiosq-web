import { CheckIcon } from "@/components/ui/icons/check-icon";
import { ProductDetailsVariantImage } from "@/features/product-details/components/product-details-variant-image";
import { ProductDetailsVariantPrices } from "@/features/product-details/components/product-details-variant-prices";
import { Locales } from "@/types/app";
import { ProductWithVariantsPricesAndProfile } from "@/utils/factories/product-factory";
import { useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";

interface ProductDetailsProps {
  product: ProductWithVariantsPricesAndProfile;
}

export const ProductDetails = ({ product }: ProductDetailsProps) => {
  const locale = useLocale() as Locales;

  return (
    <div className="flex flex-row min-xl:gap-20 max-xl:gap-10 max-md:flex-col">
      <ProductDetailsVariantImage productName={product.nameTranslations[locale]} />
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-4 items-center">
          <Image
            src={product.profileImageUrl || "/placeholders/240x140.jpg"}
            alt={product.profileNameTranslations[locale]}
            width={32}
            height={32}
            className="rounded-full"
          />
          <div className="flex flex-col gap-2">
            <Link
              href={`/${locale}/vendors/${product.profileSlugTranslations[locale]}`}
              className="text-sm text-neutral-darker"
            >
              {product.profileNameTranslations[locale]}
            </Link>
          </div>
        </div>
        <h1 className="text-2xl font-bold">{product.nameTranslations[locale]}</h1>
        <p>{product.descriptionTranslations[locale]}</p>
        <div className="flex flex-col gap-2">
          {product.checklistTranslations.map((checklist, index) => (
            <div key={index} className="flex flex-row gap-2 items-center">
              <CheckIcon className="w-4 h-4 text-brand-medium" />
              <p className="text-sm text-neutral-darker">{checklist[locale]}</p>
            </div>
          ))}
        </div>
        <ProductDetailsVariantPrices productVariant={product.productVariants} />
      </div>
    </div>
  );
};
