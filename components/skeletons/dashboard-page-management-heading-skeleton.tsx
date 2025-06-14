import { Skeleton } from "@/components/ui/skeleton";

export const DashboardPageManagementHeadingSkeleton = () => {
  return (
    <div className="pt-8">
      <div className="flex flex-row max-md:flex-col-reverse justify-between items-start gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-2 items-center">
            {/* Title skeleton */}
            <Skeleton className="h-8 w-[280px] bg-neutral-light" />
            {/* Translation badges */}
            <Skeleton className="h-6 w-8 rounded-full bg-neutral-light" />
            <Skeleton className="h-6 w-8 rounded-full bg-neutral-light" />
          </div>
          <div className="flex flex-row gap-2">
            {/* Description skeleton */}
            <Skeleton className="h-4 w-[350px] bg-neutral-light" />
            {/* Translation badges for description */}
            <Skeleton className="h-5 w-8 rounded-full bg-neutral-light" />
            <Skeleton className="h-5 w-8 rounded-full bg-neutral-light" />
          </div>
        </div>
        {/* CTA section skeleton */}
        <div className="flex-1 max-md:w-full flex justify-end">
          <div className="flex flex-col items-end gap-2">
            <div className="flex flex-row gap-2">
              {/* Status label and dropdown */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-[50px] bg-neutral-light" />
                <Skeleton className="h-8 w-[80px] rounded-md bg-neutral-light" />
              </div>
              {/* Modifier button */}
              <Skeleton className="h-10 w-[100px] rounded-md bg-neutral-light" />
            </div>
            {/* Created date timestamp */}
            <Skeleton className="h-4 w-[200px] bg-neutral-light" />
          </div>
        </div>
      </div>
    </div>
  );
};
