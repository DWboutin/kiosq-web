import { DashboardPageHeadingSkeleton } from "@/components/skeletons/dashboard-page-heading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

const CategoriesTableSkeleton = () => {
  return (
    <div>
      {/* Column visibility control skeleton */}
      <div className="flex justify-end mb-2">
        <Skeleton className="h-8 w-[140px] bg-neutral-light rounded-md" />
      </div>

      {/* Table skeleton */}
      <div className="w-full overflow-auto">
        <div className="rounded-md border bg-white overflow-hidden relative z-0">
          <div className="w-full">
            {/* Table header skeleton */}
            <div className="bg-neutral-50 border-b">
              <div className="flex items-center">
                {/* Expander column */}
                <div className="h-12 w-[60px] flex items-center justify-center">
                  <Skeleton className="h-4 w-4 bg-neutral-light" />
                </div>
                {/* Name column */}
                <div className="flex-1 h-12 flex items-center pl-6">
                  <Skeleton className="h-4 w-[60px] bg-neutral-light" />
                </div>
                {/* Description column */}
                <div className="w-[400px] h-12 flex items-center px-4">
                  <Skeleton className="h-4 w-[80px] bg-neutral-light" />
                </div>
                {/* Slug column */}
                <div className="flex-1 h-12 flex items-center px-4">
                  <Skeleton className="h-4 w-[40px] bg-neutral-light" />
                </div>
                {/* Created at column */}
                <div className="flex-1 h-12 flex items-center px-4">
                  <Skeleton className="h-4 w-[80px] bg-neutral-light" />
                </div>
                {/* Updated at column */}
                <div className="flex-1 h-12 flex items-center px-4">
                  <Skeleton className="h-4 w-[80px] bg-neutral-light" />
                </div>
                {/* Actions column */}
                <div className="w-[120px] h-12 flex items-center px-4">
                  <Skeleton className="h-4 w-[60px] bg-neutral-light" />
                </div>
              </div>
            </div>

            {/* Table body skeleton rows */}
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="border-b hover:bg-neutral-50 transition-colors">
                <div className="flex items-center">
                  {/* Expander column */}
                  <div className="h-14 w-[60px] flex items-center justify-center">
                    <Skeleton className="h-5 w-5 bg-neutral-light rounded-md" />
                  </div>
                  {/* Name column with indentation for hierarchy */}
                  <div className="flex-1 h-14 flex items-center pl-6">
                    <div className="flex items-center pl-4">
                      <Skeleton className="h-4 w-[120px] bg-neutral-light" />
                    </div>
                  </div>
                  {/* Description column */}
                  <div className="w-[400px] h-14 flex items-center px-4">
                    <div className="w-full">
                      <Skeleton className="h-4 w-[280px] bg-neutral-light" />
                    </div>
                  </div>
                  {/* Slug column */}
                  <div className="flex-1 h-14 flex items-center px-4">
                    <Skeleton className="h-4 w-[100px] bg-neutral-light" />
                  </div>
                  {/* Created at column */}
                  <div className="flex-1 h-14 flex items-center px-4">
                    <Skeleton className="h-4 w-[90px] bg-neutral-light" />
                  </div>
                  {/* Updated at column */}
                  <div className="flex-1 h-14 flex items-center px-4">
                    <Skeleton className="h-4 w-[90px] bg-neutral-light" />
                  </div>
                  {/* Actions column */}
                  <div className="w-[120px] h-14 flex items-center gap-2 px-4">
                    <Skeleton className="h-8 w-[100px] bg-neutral-light rounded-md" />
                    <Skeleton className="h-8 w-[100px] bg-neutral-light rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeadingSkeleton />
      <CategoriesTableSkeleton />
    </div>
  );
}
