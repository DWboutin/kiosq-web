"use client";

import { RawKiosq } from "@/types/app";
import { CardAdminKiosq } from "@/components/ui/card-admin-kiosq";
import { MapPinIcon } from "lucide-react";
import { useLocale } from "next-intl";

type DashboardProfileKiosqsProps = {
  kiosqsData: RawKiosq[];
  profileId: string;
};

export const DashboardProfileKiosqs = ({ kiosqsData }: DashboardProfileKiosqsProps) => {
  const locale = useLocale();

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

  const getKiosqName = (kiosq: RawKiosq) => {
    const translations = kiosq.name_translations as Record<string, string>;
    return translations[locale] || translations.en || translations.fr || "Unnamed Kiosq";
  };

  const getKiosqDescription = (kiosq: RawKiosq) => {
    const translations = kiosq.description_translations as Record<string, string>;
    return translations[locale] || translations.en || translations.fr || "";
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {kiosqsData.map((kiosq) => (
        <CardAdminKiosq
          key={kiosq.id}
          id={kiosq.id}
          name={getKiosqName(kiosq)}
          description={getKiosqDescription(kiosq)}
          status={kiosq.status}
          address={kiosq.address || undefined}
          city={kiosq.city || undefined}
          state={kiosq.state || undefined}
          country={kiosq.country || undefined}
          imageUrl={kiosq.image_url || undefined}
          isDefault={kiosq.is_default}
        />
      ))}
    </div>
  );
};
