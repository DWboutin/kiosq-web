"use client";

import { FC } from "react";
import { Control, FieldErrors } from "react-hook-form";
import { ScheduleFormValues } from "@/features/schedule-form-drawer/utils/schedule-form-validation-schema";
import { FormInputContainer } from "@/components/ui/form-utils/form-input-container";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Controller } from "react-hook-form";
import { useTranslations } from "next-intl";
import { SchedulePauseTimes } from "./schedule-pause-times";

type ScheduleFormProps = {
  control: Control<ScheduleFormValues>;
  errors: FieldErrors<ScheduleFormValues>;
};

const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: `${i.toString().padStart(2, "0")}:00`,
}));

const TIMEZONE_OPTIONS = [
  { value: "America/Toronto", label: "Eastern Time (Toronto)" },
  { value: "America/Vancouver", label: "Pacific Time (Vancouver)" },
  { value: "America/Edmonton", label: "Mountain Time (Edmonton)" },
  { value: "America/Winnipeg", label: "Central Time (Winnipeg)" },
  { value: "America/Halifax", label: "Atlantic Time (Halifax)" },
  { value: "America/St_Johns", label: "Newfoundland Time (St. John's)" },
];

export const ScheduleForm: FC<ScheduleFormProps> = ({ control, errors }) => {
  const t = useTranslations("ScheduleForm");

  return (
    <div className="space-y-6">
      {/* Timezone Selection */}
      <FormInputContainer
        inputId="timezone"
        label={t("timezone")}
        error={errors.timezone?.message}
        required
      >
        <Controller
          name="timezone"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder={t("selectTimezone")} />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormInputContainer>

      {/* Weekly Schedule */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t("weeklySchedule")}</h3>

        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium capitalize">{t(day)}</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{t("closed")}</span>
                <Controller
                  name={`${day}_is_open` as `${typeof day}_is_open`}
                  control={control}
                  render={({ field }) => (
                    <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />
                  )}
                />
                <span className="text-sm text-gray-600">{t("open")}</span>
              </div>
            </div>

            <Controller
              name={`${day}_is_open` as `${typeof day}_is_open`}
              control={control}
              render={({ field: { value: isOpen } }) => (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Open Time */}
                    <FormInputContainer
                      inputId={`${day}_open_time`}
                      label={t("openTime")}
                      error={errors[`${day}_open_time` as keyof ScheduleFormValues]?.message}
                    >
                      <Controller
                        name={`${day}_open_time` as keyof ScheduleFormValues}
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value?.toString()}
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            disabled={!isOpen}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {HOUR_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value.toString()}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </FormInputContainer>

                    {/* Close Time */}
                    <FormInputContainer
                      inputId={`${day}_close_time`}
                      label={t("closeTime")}
                      error={errors[`${day}_close_time` as keyof ScheduleFormValues]?.message}
                    >
                      <Controller
                        name={`${day}_close_time` as keyof ScheduleFormValues}
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value?.toString()}
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            disabled={!isOpen}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {HOUR_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value.toString()}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </FormInputContainer>
                  </div>

                  {/* Pause Times Management */}
                  <SchedulePauseTimes
                    day={day}
                    control={control}
                    errors={errors}
                    disabled={!isOpen}
                  />
                </div>
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
