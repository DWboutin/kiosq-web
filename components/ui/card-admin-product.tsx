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
import { DynamicLink } from "@/components/ui/dynamic-link";
import Image from "next/image";
import { AuthenticatedUserProductVariantWithPrices } from "@/utils/factories/authenticated-user-product-factory";
import { PublishedStatus } from "@/types/app";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

type CardAdminProductProps = {
  id: string;
  title: string;
  description: string;
  status: PublishedStatus;
  variants: AuthenticatedUserProductVariantWithPrices[];
};

export const CardAdminProduct = ({
  id,
  title,
  description,
  status,
  variants,
}: CardAdminProductProps) => {
  const t = useTranslations("Global");
  const variantImages = variants.map((variant) => ({
    id: variant.id,
    imageUrl: variant.imageUrl || "/placeholders/240x140.jpg",
  }));

  return (
    <Card className="flex flex-col overflow-hidden w-[240px] p-0 gap-4">
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
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p>Product content</p>
        </CardContent>
      </div>
      <CardFooter className="flex justify-end pt-0 pb-4">
        <ButtonBrand asChild>
          <DynamicLink pathKey="Pathnames.dashboard_product_id" id={id} prefetch>
            Edit
          </DynamicLink>
        </ButtonBrand>
      </CardFooter>
    </Card>
  );
};
