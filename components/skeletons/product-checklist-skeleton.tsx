import { Skeleton } from "@/components/ui/skeleton";

const ChecklistItemSkeleton = () => {
  return (
    <div className="flex flex-row items-center gap-2">
      {/* Check icon skeleton */}
      <Skeleton className="size-4 bg-neutral-light" />
      {/* Checklist text skeleton */}
      <Skeleton className="h-4 w-[200px] bg-neutral-light" />
      {/* Translation badges */}
      <Skeleton className="h-5 w-8 rounded-full bg-neutral-light" />
      <Skeleton className="h-5 w-8 rounded-full bg-neutral-light" />
      {/* Warning badge */}
      <Skeleton className="h-5 w-[80px] rounded-md bg-neutral-light" />
    </div>
  );
};

export const ProductChecklistSkeleton = () => {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <ChecklistItemSkeleton key={index} />
      ))}
    </div>
  );
};
