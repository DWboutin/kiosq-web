import { DashboardPageHeadingSkeleton } from "@/components/skeletons/dashboard-page-heading-skeleton";
import { ProductCardSkeleton } from "@/components/skeletons/product-card-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col flex-1">
      <DashboardPageHeadingSkeleton />
      <div className="flex flex-wrap gap-6 justify-start mt-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
