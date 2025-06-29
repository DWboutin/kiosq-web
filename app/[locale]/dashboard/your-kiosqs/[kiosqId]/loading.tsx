import { DashboardPageManagementHeadingSkeleton } from "@/components/skeletons/dashboard-page-management-heading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

const KiosqDetailSkeleton = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full">
      {/* Map section */}
      <div className="relative flex flex-col gap-4 w-full lg:w-[400px] lg:flex-shrink-0">
        <div className="relative">
          <Skeleton className="w-full h-[240px] bg-neutral-light rounded-lg" />
          {/* Default badge */}
          <div className="absolute top-2 right-2 z-10">
            <Skeleton className="h-6 w-[60px] bg-neutral-light rounded-full" />
          </div>
        </div>
      </div>

      {/* Address Card */}
      <div className="flex-1 min-w-0 bg-white rounded-lg border shadow-sm">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            {/* Address */}
            <div className="flex-1">
              <Skeleton className="h-7 w-[300px] bg-neutral-light mb-1" />
              <Skeleton className="h-5 w-[200px] bg-neutral-light" />
            </div>
            {/* Status badge */}
            <div className="flex gap-2 flex-shrink-0">
              <Skeleton className="h-6 w-[80px] bg-neutral-light rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Loading() {
  return (
    <div className="flex flex-col flex-1 gap-10">
      <DashboardPageManagementHeadingSkeleton />
      <KiosqDetailSkeleton />
    </div>
  );
}
