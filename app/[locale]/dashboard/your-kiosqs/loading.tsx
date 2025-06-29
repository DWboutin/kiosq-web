import { DashboardPageHeadingSkeleton } from "@/components/skeletons/dashboard-page-heading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

const KiosqCardSkeleton = () => {
  return (
    <div className="flex flex-col overflow-hidden w-[280px] p-0 gap-4 bg-white rounded-lg border shadow-sm">
      {/* Map area with badges */}
      <div className="relative">
        <Skeleton className="w-full h-40 bg-neutral-light rounded-t-lg" />
        {/* Status badge - top right */}
        <div className="absolute top-2 right-2">
          <Skeleton className="h-6 w-[80px] bg-neutral-light rounded-full" />
        </div>
        {/* Published status badge - top left */}
        <div className="absolute top-2 left-2">
          <Skeleton className="h-6 w-[70px] bg-neutral-light rounded-full" />
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {/* Header section */}
        <div className="gap-2 pb-2 px-6 pt-2">
          {/* Default/Secondary badge */}
          <Skeleton className="h-6 w-[80px] bg-neutral-light rounded-full mb-2" />
          {/* Title */}
          <Skeleton className="h-7 w-[200px] bg-neutral-light mb-2" />
          {/* Description */}
          <Skeleton className="h-4 w-[240px] bg-neutral-light mb-1" />
          <Skeleton className="h-4 w-[180px] bg-neutral-light" />
        </div>

        {/* Address section */}
        <div className="pt-0 px-6">
          <div className="flex items-start gap-2">
            <Skeleton className="h-4 w-4 bg-neutral-light rounded-sm mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-4 w-[180px] bg-neutral-light mb-1" />
              <Skeleton className="h-4 w-[150px] bg-neutral-light" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer with buttons */}
      <div className="flex flex-col gap-2 pt-0 pb-4 px-6">
        <Skeleton className="h-10 w-full bg-neutral-light rounded-md" />
        <Skeleton className="h-10 w-full bg-neutral-light rounded-md" />
      </div>
    </div>
  );
};

const KiosqsGridSkeleton = () => {
  return (
    <div className="flex flex-wrap gap-6 justify-start">
      {Array.from({ length: 6 }).map((_, index) => (
        <KiosqCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default function Loading() {
  return (
    <div className="flex flex-col flex-1 gap-10">
      <DashboardPageHeadingSkeleton />
      <div className="flex flex-col flex-1">
        <KiosqsGridSkeleton />
      </div>
    </div>
  );
}
