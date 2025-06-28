"use client";

import { AuthenticatedUserKiosq } from "@/utils/factories/authenticated-user-kiosqs-factory";
import { CardAdminKiosq } from "@/components/ui/card-admin-kiosq";
import { MapPinIcon } from "lucide-react";
import { useLocale } from "next-intl";
import { Locales } from "@/types/app";

type DashboardProfileKiosqsProps = {
  kiosqsData: AuthenticatedUserKiosq[];
  profileId: string;
};

export const DashboardProfileKiosqs = ({ kiosqsData }: DashboardProfileKiosqsProps) => {
  const locale = useLocale() as Locales;

  if (!kiosqsData || kiosqsData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <MapPinIcon className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No kiosqs yet</h3>
        <p className="text-muted-foreground mb-4">
          Create your first kiosq to start selling your products at physical locations.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {kiosqsData.map((kiosq) => (
        <CardAdminKiosq
          key={kiosq.id}
          id={kiosq.id}
          name={kiosq.nameTranslations[locale]}
          description={kiosq.descriptionTranslations[locale]}
          storeStatus={kiosq.storeStatus}
          address={kiosq.address!}
          city={kiosq.city!}
          state={kiosq.state!}
          country={kiosq.country!}
          latitude={kiosq.latitude!}
          longitude={kiosq.longitude!}
          isDefault={kiosq.isDefault}
          profileId={kiosq.profileId}
        />
      ))}
    </div>
  );
};
