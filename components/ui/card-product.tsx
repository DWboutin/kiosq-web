import { ButtonBrand } from "@/components/ui/button-brand";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { Locales, PublishedStatus } from "@/types/app";
import { Badge } from "@/components/ui/badge";
import { useLocale, useTranslations } from "next-intl";
import { ProductVariantWithPrices } from "@/utils/factories/product-factory";
import { slugify } from "@/utils/slugify";
import Link from "next/link";
import { cn } from "@/lib/utils";

type CardProductProps = {
  id: string;
  title: string;
  description: string;
  status: PublishedStatus;
  variants: ProductVariantWithPrices[];
  profileName?: string;
  className?: string;
};

export const CardProduct = ({
  id,
  title,
  description,
  status,
  variants,
  profileName,
  className,
}: CardProductProps) => {
  const t = useTranslations("Global");
  const locale = useLocale() as Locales;
  const variantImages = variants
    .filter((variant) => variant.imageUrl)
    .map((variant) => ({
      id: variant.id,
      imageUrl: variant.imageUrl || "/placeholders/240x140.jpg",
    }));
  const href = `/${locale}/products/${slugify(title)}/${id}`;

  return (
    <Card className={cn("flex flex-col overflow-hidden w-[240px] p-0 gap-4", className)}>
      <div className="relative">
        <Carousel>
          <CarouselContent>
            {variantImages.map((variant) => (
              <CarouselItem key={variant.id}>
                <Image
                  src={variant.imageUrl || "/placeholders/240x140.jpg"}
                  alt="Product"
                  width={240}
                  height={140}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          {variantImages.length > 1 && (
            <>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </>
          )}
        </Carousel>
        {status !== "published" && (
          <Badge className="absolute top-2 left-2 bg-neutral-darker text-white">
            {t(`${status}`)}
          </Badge>
        )}
      </div>
      <div className="flex-1 flex flex-col gap-4">
        <CardHeader className="gap-2">
          <CardTitle>
            <div className="flex flex-col gap-1">
              <div className="text-sm font-normal text-neutral-medium">{profileName}</div>
              <Link href={href}>{title}</Link>
            </div>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {variants.length > 0 ? (
            <div className="space-y">
              <p className="text-sm font-medium text-muted-foreground">
                Variants ({variants.length})
              </p>
              {variants.map((variant) => (
                <div key={variant.id} className="flex justify-between items-center text-sm">
                  <div className="flex flex-col">
                    <span className="truncate">
                      {variant.quantity} {variant.unit}
                    </span>
                    {variant.sku && (
                      <span className="text-xs text-muted-foreground">SKU: {variant.sku}</span>
                    )}
                  </div>
                  <span className="font-medium">
                    {variant.productPrices.length > 0
                      ? `$${variant.productPrices[0].basePrice.toFixed(2)}`
                      : "No price"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No variants</p>
          )}
        </CardContent>
      </div>
      <CardFooter className="flex justify-end pt-0 pb-4">
        <ButtonBrand>Acheter</ButtonBrand>
      </CardFooter>
    </Card>
  );
};
