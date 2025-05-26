import { BadgeWarning } from "@/components/ui/badge-warning";
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

type CardAdminProductProps = {
  id: string;
};

export const CardAdminProduct = ({ id }: CardAdminProductProps) => {
  return (
    <Card className="flex flex-col pt-0 overflow-hidden w-[240px] gap-0">
      <div className="relative">
        <Carousel>
          <CarouselContent>
            <CarouselItem>
              <Image src="/placeholders/240x140.jpg" alt="Product" width={240} height={140} />
            </CarouselItem>
            <CarouselItem>
              <Image src="/placeholders/240x140.jpg" alt="Product" width={240} height={140} />
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
      </div>
      <div className="px-6 py-2">
        <BadgeWarning>missing things</BadgeWarning>
      </div>
      <CardHeader>
        <CardTitle>Product</CardTitle>
        <CardDescription>Product description</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 py-4">
        <p>Product content</p>
      </CardContent>
      <CardFooter className="flex justify-end">
        <ButtonBrand asChild>
          <DynamicLink pathKey="Pathnames.dashboard_product_id" id={id}>
            Edit
          </DynamicLink>
        </ButtonBrand>
      </CardFooter>
    </Card>
  );
};
