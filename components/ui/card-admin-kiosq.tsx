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
import { MapPinIcon, ClockIcon } from "lucide-react";
import { MapView } from "@/components/ui/map-view";
import { useTranslations } from "next-intl";

type CardAdminKiosqProps = {
  id: string;
  name: string;
  description: string;
  status: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
};

export const CardAdminKiosq = ({
  id,
  name,
  description,
  status,
  address,
  city,
  state,
  country,
  latitude,
  longitude,
  isDefault,
}: CardAdminKiosqProps) => {
  const t = useTranslations("DashboardProfileKiosqById");
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
        <Badge className={`absolute top-2 right-2 ${getStatusColor(status)}`}>
          <ClockIcon className="h-3 w-3 mr-1" />
          {t(status)}
        </Badge>
        {isDefault && (
          <Badge variant="outline" className="absolute top-2 left-2 bg-white">
            {t("default")}
          </Badge>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <CardHeader className="gap-2 pb-2">
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

      <CardFooter className="flex justify-end pt-0 pb-4">
        <ButtonBrand asChild>
          <DynamicLink pathKey="Pathnames.dashboard_kiosq_id" id={id} prefetch>
            Edit
          </DynamicLink>
        </ButtonBrand>
      </CardFooter>
    </Card>
  );
};
