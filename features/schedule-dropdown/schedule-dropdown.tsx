import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TooltipContainer } from "@/components/ui/tooltip-container";
import { ScheduleTooltipDisplay } from "@/features/schedule-dropdown/components/schedule-tooltip-display";
import { useCurrentUserProfileIdSchedules } from "@/hooks/use-current-user-profile-id-schedules";
import { Locales } from "@/types/app";
import { useLocale, useTranslations } from "next-intl";
import { FC } from "react";
import { FieldErrors } from "react-hook-form";

type ScheduleDropdownProps = {
  value?: string;
  onChange: (value: string) => void;
  profileId: string;
  errors: FieldErrors;
};

export const ScheduleDropdown: FC<ScheduleDropdownProps> = ({
  value,
  onChange,
  errors,
  profileId,
}) => {
  const t = useTranslations("ScheduleDropdown");
  const locale = useLocale() as Locales;
  const {
    selectors: { schedules },
  } = useCurrentUserProfileIdSchedules({ profileId });

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id="scheduleDropdown" aria-invalid={!!errors.schedule}>
        <SelectValue placeholder={t("placeholder")} />
      </SelectTrigger>
      <SelectContent>
        {schedules.map((schedule) => (
          <TooltipContainer
            key={schedule.id}
            contentProps={{ side: "right" }}
            content={<ScheduleTooltipDisplay schedule={schedule} compact />}
          >
            <SelectItem value={schedule.id}>{schedule.nameTranslations[locale]}</SelectItem>
          </TooltipContainer>
        ))}
      </SelectContent>
    </Select>
  );
};
