"use client";

import { useLocale } from "next-intl";
import { Locales } from "@/types/app";
import { useKiosqsByProfileId } from "@/hooks/use-kiosqs-by-profile-id";
import { Kiosq } from "@/utils/factories/kiosqs-factory";
import { DistanceAwayFromUser } from "@/features/distance-away-from-user/distance-away-from-user";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ReservationButtonModalKiosqsDropdownProps = {
  profileId: string;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
};

export const ReservationButtonModalKiosqsDropdown = ({
  profileId,
  value,
  onValueChange,
  placeholder = "Select a kiosq...",
}: ReservationButtonModalKiosqsDropdownProps) => {
  const locale = useLocale() as Locales;
  const { selectors } = useKiosqsByProfileId(profileId);
  const { kiosqs, isLoading, isError } = selectors;

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Loading kiosqs..." />
        </SelectTrigger>
      </Select>
    );
  }

  if (isError || !kiosqs) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Error loading kiosqs" />
        </SelectTrigger>
      </Select>
    );
  }

  if (kiosqs.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="No kiosqs available" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {kiosqs.map((kiosq: Kiosq) => (
          <SelectItem key={kiosq.id} value={kiosq.id}>
            <div className="flex items-center justify-between w-full">
              <span className="flex-1">{kiosq.nameTranslations[locale]}</span>
              <DistanceAwayFromUser
                latitude={kiosq.latitude}
                longitude={kiosq.longitude}
                className="text-xs text-muted-foreground ml-2"
              />
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
