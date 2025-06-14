import { DashboardPageManagementHeadingSkeleton } from "@/components/skeletons/dashboard-page-management-heading-skeleton";
import { BadgeCategorySkeleton } from "@/components/skeletons/badge-category-skeleton";
import { ProductChecklistSkeleton } from "@/components/skeletons/product-checklist-skeleton";
import { CardAdminProductVariantSkeleton } from "@/components/skeletons/card-admin-product-variant-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        {/* Dashboard page management heading with title, description, and CTA */}
        <DashboardPageManagementHeadingSkeleton />

        <div className="flex flex-row justify-between gap-2">
          <div className="flex flex-col gap-2">
            {/* Badge category skeleton */}
            <BadgeCategorySkeleton />

            {/* Product checklist skeleton */}
            <ProductChecklistSkeleton />
          </div>
        </div>
      </div>

      {/* Variants section */}
      <div className="flex flex-col gap-4">
        {/* Variants title skeleton */}
        <Skeleton className="h-6 w-[120px] bg-neutral-light" />

        {/* Variants grid skeleton */}
        <div className="flex flex-wrap gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <CardAdminProductVariantSkeleton key={index} />
          ))}
        </div>
      </div>

      {/* Debug info skeletons */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-[60px] bg-neutral-light" />
        <Skeleton className="h-[200px] w-full bg-neutral-light rounded-md" />
      </div>
    </div>
  );
}
