import { Skeleton } from "@/components/ui/skeleton";

export const DashboardPageHeadingSkeleton = () => {
  return (
    <div className="flex flex-row max-md:flex-col justify-between items-start gap-4 pt-8">
      <div className="flex flex-col gap-2">
        {/* Title skeleton */}
        <Skeleton className="h-8 w-[200px] bg-neutral-light" />
        {/* Description skeleton */}
        <Skeleton className="h-4 w-[300px] bg-neutral-light" />
      </div>
      {/* CTA button skeleton */}
      <div className="flex flex-row gap-2">
        <Skeleton className="h-10 w-[120px] rounded-md bg-neutral-light" />
      </div>
    </div>
  );
};
