"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { useCurrentUserKiosqById } from "@/hooks/use-current-user-kiosq-by-id";
import { AuthenticatedUserKiosq } from "@/utils/factories/authenticated-user-kiosqs-factory";
import { FC } from "react";
import { MapView } from "@/components/ui/map-view";

type DashboardProfileKiosqByIdProps = {
  kiosqData: AuthenticatedUserKiosq;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "open":
      return "bg-brand-medium text-white";
    case "temporary closed":
      return "bg-yellow-500 text-white";
    case "closed":
    default:
      return "bg-gray-500 text-white";
  }
};

export const DashboardProfileKiosqById: FC<DashboardProfileKiosqByIdProps> = ({ kiosqData }) => {
  const t = useTranslations("DashboardProfileKiosqById");
  const {
    selectors: { kiosq, isLoading, error },
  } = useCurrentUserKiosqById({ kiosqData });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error?.message}</div>;
  }

  if (!kiosq) {
    return <div>Kiosq not found</div>;
  }

  // Format the address
  const fullAddress = [kiosq.address, kiosq.city, kiosq.state, kiosq.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full">
      {kiosq.latitude && kiosq.longitude && (
        <div className="relative flex flex-col gap-4 w-full lg:w-[400px] lg:flex-shrink-0">
          <MapView
            latitude={kiosq.latitude}
            longitude={kiosq.longitude}
            height={240}
            className="rounded-lg shadow-sm w-full"
          />
          {kiosq.isDefault && (
            <Badge
              variant="secondary"
              className="bg-brand-medium text-neutral-white absolute top-2 right-2 z-10"
            >
              {t("default")}
            </Badge>
          )}
        </div>
      )}

      {/* Address Card */}
      <Card className="flex-1 min-w-0">
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900 leading-tight flex-1">
              {fullAddress || t("notAvailable")}
            </h2>
            <div className="flex gap-2 flex-shrink-0">
              <Badge className={`${getStatusColor(kiosq.storeStatus)} text-xs px-2 py-1`}>
                {t(kiosq.storeStatus)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
