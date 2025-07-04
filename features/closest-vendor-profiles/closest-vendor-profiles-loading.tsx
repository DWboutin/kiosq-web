import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";

export const ClosestVendorProfilesLoading = () => {
  const t = useTranslations("ClosestVendorProfiles");

  return (
    <div className="flex flex-row gap-4 max-md:flex-col container mx-auto max-sm:px-4">
      {/* Left side - Vendor profiles section */}
      <div className="flex flex-col w-1/2 gap-4 max-md:w-full">
        {/* Title and subtitle skeleton */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold mb-4">
              {t("title")} <span className="text-neutral-medium font-normal">{t("subTitle")}</span>
            </h2>
          </div>
        </div>

        {/* Vendor profile images skeleton */}
        <div className="flex flex-row flex-wrap gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton
              key={index}
              className="w-[86px] h-[86px] rounded-full bg-neutral-light shadow-md"
            />
          ))}
        </div>
      </div>

      {/* Right side - Map skeleton */}
      <div className="w-1/2 max-md:w-full shadow-md rounded-lg overflow-hidden">
        <Skeleton className="w-full h-[300px] bg-neutral-light border border-gray-200 rounded-lg" />
      </div>
    </div>
  );
};
