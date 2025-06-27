"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPinIcon, ClockIcon } from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useCurrentUserKiosqById } from "@/hooks/use-current-user-kiosq-by-id";
import { AuthenticatedUserKiosq } from "@/utils/factories/authenticated-user-kiosq-factory";
import { FC } from "react";

type DashboardProfileKiosqByIdProps = {
  kiosqData: AuthenticatedUserKiosq;
};

export const DashboardProfileKiosqById: FC<DashboardProfileKiosqByIdProps> = ({ kiosqData }) => {
  const locale = useLocale();
  const {
    selectors: { kiosq, isLoading, error },
  } = useCurrentUserKiosqById({ kiosqData });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "temporary closed":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "closed":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getKiosqName = (kiosqData: AuthenticatedUserKiosq) => {
    return (
      kiosqData.nameTranslations[locale] ||
      kiosqData.nameTranslations.en ||
      kiosqData.nameTranslations.fr ||
      "Unnamed Kiosq"
    );
  };

  const getKiosqDescription = (kiosqData: AuthenticatedUserKiosq) => {
    return (
      kiosqData.descriptionTranslations[locale] ||
      kiosqData.descriptionTranslations.en ||
      kiosqData.descriptionTranslations.fr ||
      ""
    );
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error?.message}</div>;
  }

  if (!kiosq) {
    return <div>Kiosq not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{getKiosqName(kiosq)}</h1>
          {kiosq.is_default && (
            <Badge variant="outline" className="mb-4">
              Default Kiosq
            </Badge>
          )}
        </div>
        <Badge className={getStatusColor(kiosq.status)}>
          <ClockIcon className="h-4 w-4 mr-2" />
          {kiosq.status}
        </Badge>
      </div>

      {/* Image */}
      {kiosq.image_url && (
        <Card>
          <CardContent className="p-0">
            <Image
              src={kiosq.image_url}
              alt={getKiosqName(kiosq)}
              width={800}
              height={400}
              className="w-full h-64 object-cover rounded-t-lg"
            />
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {getKiosqDescription(kiosq) && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{getKiosqDescription(kiosq)}</p>
          </CardContent>
        </Card>
      )}

      {/* Location Information */}
      {(kiosq.address || kiosq.city || kiosq.state) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPinIcon className="h-5 w-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {kiosq.address && (
              <div>
                <span className="font-medium">Address:</span> {kiosq.address}
              </div>
            )}
            <div>
              <span className="font-medium">Location:</span>{" "}
              {[kiosq.city, kiosq.state, kiosq.country].filter(Boolean).join(", ")}
            </div>
            {kiosq.latitude && kiosq.longitude && (
              <div>
                <span className="font-medium">Coordinates:</span> {kiosq.latitude},{" "}
                {kiosq.longitude}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="font-medium">Status:</span>{" "}
            <Badge className={getStatusColor(kiosq.status)}>{kiosq.status}</Badge>
          </div>
          <div>
            <span className="font-medium">Default Kiosq:</span> {kiosq.is_default ? "Yes" : "No"}
          </div>
          {kiosq.created_at && (
            <div>
              <span className="font-medium">Created:</span>{" "}
              {new Date(kiosq.created_at).toLocaleDateString()}
            </div>
          )}
          {kiosq.updated_at && (
            <div>
              <span className="font-medium">Last Updated:</span>{" "}
              {new Date(kiosq.updated_at).toLocaleDateString()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
