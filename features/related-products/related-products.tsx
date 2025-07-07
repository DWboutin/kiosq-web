import { getRelatedProducts } from "@/utils/requests/get-related-products";
import { CardProduct } from "@/components/ui/card-product";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getLocale, getTranslations } from "next-intl/server";
import { Locales } from "@/types/app";

type RelatedProductsProps = {
  productId: string;
};

export const RelatedProducts = async ({ productId }: RelatedProductsProps) => {
  const locale = (await getLocale()) as Locales;
  const t = await getTranslations("RelatedProducts");
  const relatedProducts = await getRelatedProducts(productId);

  if (!relatedProducts || relatedProducts.length === 0) {
    return null;
  }

  // Calculate if we need navigation arrows
  // Assuming each card is ~240px wide with 16px gap, and container is responsive
  const showNavigation = relatedProducts.length > 4;

  return (
    <div className="max-md:py-4 min-md:py-8 flex flex-col gap-4">
      <h2 className="text-xl font-bold text-neutral-darker">{t("title")}</h2>
      <Carousel
        opts={{
          align: "start",
          slidesToScroll: 1,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {relatedProducts.map((product) => (
            <CarouselItem key={product.id} className="pl-4 basis-auto">
              <CardProduct
                id={product.id}
                title={product.nameTranslations[locale]}
                description={product.descriptionTranslations[locale]}
                status={product.status}
                variants={product.productVariants}
                profileName={product.profileNameTranslations[locale]}
                className="shadow-none"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        {showNavigation && (
          <>
            <CarouselPrevious />
            <CarouselNext />
          </>
        )}
      </Carousel>
    </div>
  );
};
