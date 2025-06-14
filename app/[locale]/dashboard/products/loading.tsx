import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

const ProductCardSkeleton = () => {
  return (
    <Card className="flex flex-col overflow-hidden w-[240px] p-0 gap-4">
      {/* Image carousel skeleton */}
      <div className="relative">
        <Skeleton className="w-[240px] h-[140px] rounded-none" />
      </div>

      {/* Card content skeleton */}
      <div className="flex-1 flex flex-col gap-4">
        <CardHeader className="gap-2">
          {/* Title skeleton */}
          <Skeleton className="h-6 w-[180px]" />
          {/* Description skeleton */}
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[160px]" />
        </CardHeader>

        <CardContent className="flex flex-col gap-2">
          {/* Product content skeleton */}
          <Skeleton className="h-4 w-[120px]" />
        </CardContent>
      </div>

      {/* Footer button skeleton */}
      <CardFooter className="flex justify-end pt-0 pb-4">
        <Skeleton className="h-9 w-[60px] rounded-md" />
      </CardFooter>
    </Card>
  );
};

export default function Loading() {
  return (
    <div className="flex flex-wrap gap-6 justify-start mt-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
