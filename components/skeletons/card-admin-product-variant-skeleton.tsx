import { Skeleton } from "@/components/ui/skeleton";

export const CardAdminProductVariantSkeleton = () => {
  return (
    <div className="flex flex-col overflow-hidden w-[240px] p-0 gap-4 border rounded-lg bg-white">
      <div className="relative">
        {/* Image skeleton */}
        <Skeleton className="w-[240px] h-[140px] bg-neutral-light" />
        {/* Default badge skeleton */}
        <div className="absolute top-2 left-2">
          <Skeleton className="h-6 w-[80px] rounded-md bg-neutral-medium" />
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <div className="gap-2 px-6 pt-2">
          {/* Title skeleton */}
          <Skeleton className="h-6 w-[120px] bg-neutral-light" />
        </div>
        <div className="flex flex-col gap-2 px-6">
          <div className="flex justify-end items-center">
            {/* Price skeleton */}
            <Skeleton className="h-5 w-[80px] bg-neutral-light" />
          </div>
        </div>
      </div>
      <div className="flex justify-end pt-0 pb-4 px-6">
        {/* Edit button skeleton */}
        <Skeleton className="h-10 w-full rounded-md bg-neutral-light" />
      </div>
    </div>
  );
};
