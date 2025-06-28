import { deleteKiosq } from "@/actions/delete-kiosq";
import { ButtonBrand } from "@/components/ui/button-brand";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DynamicLink } from "@/components/ui/dynamic-link";
import { Badge } from "@/components/ui/badge";
import { MapPinIcon, ClockIcon, TrashIcon } from "lucide-react";
import { MapView } from "@/components/ui/map-view";
import { useTranslations } from "next-intl";
import { PublishedStatus, StoreStatus } from "@/types/app";
import { ButtonWithConfirmationModal } from "@/features/button-with-confirmation-modal/button-with-confirmation-modal";
import { cacheKeys } from "@/utils/cache-keys";
import { useQueryClient } from "@tanstack/react-query";

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

type CardAdminKiosqProps = {
  id: string;
  name: string;
  description: string;
  status: PublishedStatus;
  storeStatus: StoreStatus;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  profileId: string;
};

export const CardAdminKiosq = ({
  id,
  name,
  description,
  status,
  storeStatus,
  address,
  city,
  state,
  country,
  latitude,
  longitude,
  isDefault,
  profileId,
}: CardAdminKiosqProps) => {
  const t = useTranslations("DashboardProfileKiosqById");
  const queryClient = useQueryClient();

  const handleDeleteKiosq = async () => {
    await deleteKiosq({ kiosqId: id });
    // Invalidate queries to refresh the kiosq list
    await queryClient.invalidateQueries({
      queryKey: cacheKeys.currentUserProfileIdKiosqs.list(profileId).queryKey,
    });
  };

  return (
    <Card className="flex flex-col overflow-hidden w-[280px] p-0 gap-4">
      <div className="relative">
        <MapView
          width={280}
          height={160}
          latitude={latitude}
          longitude={longitude}
          className="w-full h-40 rounded-t-lg"
        />
        <Badge className={`absolute top-2 right-2 ${getStatusColor(storeStatus)}`}>
          <ClockIcon className="h-3 w-3 mr-1" />
          {t(storeStatus)}
        </Badge>
        {status !== "published" && (
          <Badge className="absolute top-2 left-2 bg-neutral-darker text-white">
            {t(`${status}`)}
          </Badge>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <CardHeader className="gap-2 pb-2">
          {isDefault && (
            <Badge variant="outline" className="bg-white">
              {t("default")}
            </Badge>
          )}
          <CardTitle className="text-lg">{name}</CardTitle>
          {description && <CardDescription className="line-clamp-2">{description}</CardDescription>}
        </CardHeader>

        {(address || city || state) && (
          <CardContent className="pt-0">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPinIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                {address && <div>{address}</div>}
                <div>{[city, state, country].filter(Boolean).join(", ")}</div>
              </div>
            </div>
          </CardContent>
        )}
      </div>

      <CardFooter className="flex flex-col gap-2 pt-0 pb-4">
        <ButtonBrand asChild className="w-full">
          <DynamicLink pathKey="Pathnames.dashboard_kiosq_id" id={id} prefetch>
            Edit
          </DynamicLink>
        </ButtonBrand>
        {!isDefault && (
          <ButtonWithConfirmationModal
            title={t("deleteModalTitle")}
            description={t("deleteModalDescription")}
            confirmLabel={t("deleteModalButton")}
            cancelLabel={t("cancelModalButton")}
            action={handleDeleteKiosq}
          >
            <ButtonBrand className="w-full" variant="destructive">
              <TrashIcon className="h-4 w-4 mr-2" />
              {t("deleteKiosq")}
            </ButtonBrand>
          </ButtonWithConfirmationModal>
        )}
      </CardFooter>
    </Card>
  );
};
