import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ProductCardSkeleton = () => {
  return (
    <Card className="flex flex-col overflow-hidden w-[240px] p-0 gap-4">
      {/* Image carousel skeleton */}
      <div className="relative">
        <Skeleton className="w-[240px] h-[140px] rounded-none bg-neutral-light" />
      </div>

      {/* Card content skeleton */}
      <div className="flex-1 flex flex-col gap-4">
        <CardHeader className="gap-2">
          {/* Title skeleton */}
          <Skeleton className="h-6 w-[180px] bg-neutral-light" />
          {/* Description skeleton */}
          <Skeleton className="h-4 w-[200px] bg-neutral-light" />
          <Skeleton className="h-4 w-[160px] bg-neutral-light" />
        </CardHeader>

        <CardContent className="flex flex-col gap-2">
          {/* Product content skeleton */}
          <Skeleton className="h-4 w-[120px] bg-neutral-light" />
        </CardContent>
      </div>

      {/* Footer button skeleton */}
      <CardFooter className="flex justify-end pt-0 pb-4">
        <Skeleton className="h-9 w-[60px] rounded-md bg-neutral-light" />
      </CardFooter>
    </Card>
  );
};
