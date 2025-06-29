import { DashboardPageHeadingSkeleton } from "@/components/skeletons/dashboard-page-heading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

const VendorStoreHeaderSkeleton = () => {
  return (
    <div className="relative flex flex-col flex-1 max-w-[1200px] mx-auto overflow-hidden rounded-2xl bg-neutral-white shadow-md">
      {/* Banner image skeleton - exact dimensions from AdminVendorBannerImage */}
      <div className="relative z-0">
        <Skeleton className="w-[1200px] h-[400px] bg-neutral-light" />
        {/* Edit banner button skeleton */}
        <div className="absolute top-5 right-5">
          <Skeleton className="h-8 w-[120px] bg-neutral-light rounded-md" />
        </div>
      </div>

      <div className="flex flex-row flex-1 gap-5 z-10">
        {/* Profile image skeleton - exact positioning from AdminVendorProfileImage */}
        <div className="relative">
          <Skeleton className="w-[182px] h-[182px] rounded-full border-2 border-neutral-white mt-[-92px] ml-5 bg-neutral-light" />
          {/* Edit profile button skeleton */}
          <div className="absolute top-0 right-0">
            <Skeleton className="w-8 h-8 rounded-full bg-neutral-light" />
          </div>
        </div>

        <div className="flex flex-1 flex-row gap-2 items-start justify-between">
          <div className="flex flex-col flex-1 py-5">
            {/* Store name skeleton - text-2xl font-bold */}
            <Skeleton className="h-8 w-[280px] bg-neutral-light mb-1" />
            {/* Store description skeleton - text-sm */}
            <Skeleton className="h-5 w-[400px] bg-neutral-light" />
          </div>

          {/* Social buttons skeleton */}
          <div className="flex flex-row gap-2 items-start py-5 pr-5">
            <Skeleton className="h-10 w-10 rounded-md bg-neutral-light" />
            <Skeleton className="h-10 w-10 rounded-md bg-neutral-light" />
            <Skeleton className="h-10 w-10 rounded-md bg-neutral-light" />
            <Skeleton className="h-10 w-10 rounded-md bg-neutral-light" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Loading() {
  return (
    <div className="flex flex-col flex-1 gap-10">
      <DashboardPageHeadingSkeleton />
      <div className="flex flex-col flex-1">
        <VendorStoreHeaderSkeleton />
      </div>
    </div>
  );
}
