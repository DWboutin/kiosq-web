"use client";

import { FC } from "react";
import { Control, FieldErrors, useWatch } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Controller } from "react-hook-form";
import { useTranslations } from "next-intl";
import { SchedulePauseTimes } from "./schedule-pause-times";
import { AddTranslationField } from "@/features/add-translation-field/add-translation-field";
import { Input } from "@/components/ui/input";
import { DayOfWeek } from "@/types/app";

type ScheduleFormProps = {
  control: Control<ScheduleFormValues>;
  errors: FieldErrors<ScheduleFormValues>;
};

const DAYS_OF_WEEK: readonly DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: i.toString().padStart(2, "0"),
}));

const MINUTE_OPTIONS = Array.from({ length: 4 }, (_, i) => {
  const minutes = i * 15;
  return {
    value: minutes,
    label: minutes.toString().padStart(2, "0"),
  };
});

const TIMEZONE_OPTIONS = [
  { value: "America/Toronto", label: "Eastern Time (Toronto)" },
  { value: "America/Vancouver", label: "Pacific Time (Vancouver)" },
  { value: "America/Edmonton", label: "Mountain Time (Edmonton)" },
  { value: "America/Winnipeg", label: "Central Time (Winnipeg)" },
  { value: "America/Halifax", label: "Atlantic Time (Halifax)" },
  { value: "America/St_Johns", label: "Newfoundland Time (St. John's)" },
];

const timeToHours = (time: number): number => Math.floor(time / 100);
const timeToMinutes = (time: number): number => time % 100;
const hoursMinutesToTime = (hours: number, minutes: number): number => hours * 100 + minutes;

// Helper function to get filtered hour options for close time
const getFilteredCloseHourOptions = (openTime: number) => {
  const openHour = timeToHours(openTime);

  return HOUR_OPTIONS.filter((option) => {
    // Allow same hour and later hours
    return option.value >= openHour;
  });
};

// Helper function to get filtered minute options for close time
const getFilteredCloseMinuteOptions = (openTime: number, closeHour: number) => {
  const openHour = timeToHours(openTime);
  const openMinute = timeToMinutes(openTime);

  // If close hour is the same as open hour, filter minutes
  if (closeHour === openHour) {
    return MINUTE_OPTIONS.filter((option) => option.value > openMinute);
  }

  // If close hour is after open hour, all minutes are available
  return MINUTE_OPTIONS;
};

export const ScheduleForm: FC<ScheduleFormProps> = ({ control, errors }) => {
  const t = useTranslations("ScheduleForm");

  // Watch all form values to enable dynamic filtering
  const watchedValues = useWatch({ control });

  return (
    <div className="space-y-6">
      <FormInputContainer inputId="name" label={t("name")} error={errors.name?.message} required>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              id="name"
              placeholder={t("namePlaceholder")}
              aria-invalid={!!errors.name}
              {...field}
            />
          )}
        />
      </FormInputContainer>
      <AddTranslationField name="name" control={control} errors={errors} />

      {/* Default Schedule Checkbox */}
      <FormInputContainer
        inputId="is_default"
        label={t("defaultSchedule")}
        error={errors.is_default?.message}
      >
        <Controller
          name="is_default"
          control={control}
          render={({ field }) => (
            <div className="flex items-center space-x-2">
              <Checkbox id="is_default" checked={field.value} onCheckedChange={field.onChange} />
              <label
                htmlFor="is_default"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t("setAsDefaultSchedule")}
              </label>
            </div>
          )}
        />
      </FormInputContainer>

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

        {DAYS_OF_WEEK.map((day) => {
          const openTime =
            (watchedValues[`${day}_open_time` as keyof ScheduleFormValues] as number) || 900;
          const isOpen = watchedValues[`${day}_is_open` as keyof ScheduleFormValues] as boolean;

          return (
            <div key={day} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium capitalize">{t(day)}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{t("closed")}</span>
                  <Controller
                    name={`${day}_is_open` as `${typeof day}_is_open`}
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={Boolean(field.value)}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-brand-medium"
                      />
                    )}
                  />
                  <span className="text-sm text-gray-600">{t("open")}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  {/* Open Time */}
                  <FormInputContainer
                    inputId={`${day}_open_time`}
                    label={t("openTime")}
                    error={
                      errors[`${day}_open_time` as keyof ScheduleFormValues]?.message as string
                    }
                  >
                    <Controller
                      name={`${day}_open_time` as keyof ScheduleFormValues}
                      control={control}
                      render={({ field }) => (
                        <div className="flex gap-2">
                          {/* Hours */}
                          <Select
                            value={timeToHours(Number(field.value) || 0).toString()}
                            onValueChange={(hours) => {
                              const currentMinutes = timeToMinutes(Number(field.value) || 0);
                              const newTime = hoursMinutesToTime(parseInt(hours), currentMinutes);
                              field.onChange(newTime);
                            }}
                            disabled={!isOpen}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="--" />
                            </SelectTrigger>
                            <SelectContent>
                              {HOUR_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value.toString()}>
                                  {option.label}h
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select
                            value={timeToMinutes(Number(field.value) || 0).toString()}
                            onValueChange={(minutes) => {
                              const currentHours = timeToHours(Number(field.value) || 0);
                              const newTime = hoursMinutesToTime(currentHours, parseInt(minutes));
                              field.onChange(newTime);
                            }}
                            disabled={!isOpen}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="--" />
                            </SelectTrigger>
                            <SelectContent>
                              {MINUTE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value.toString()}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    />
                  </FormInputContainer>

                  {/* Close Time */}
                  <FormInputContainer
                    inputId={`${day}_close_time`}
                    label={t("closeTime")}
                    error={
                      errors[`${day}_close_time` as keyof ScheduleFormValues]?.message as string
                    }
                  >
                    <Controller
                      name={`${day}_close_time` as keyof ScheduleFormValues}
                      control={control}
                      render={({ field }) => {
                        const currentCloseHour = timeToHours(Number(field.value) || 0);
                        const filteredHourOptions = getFilteredCloseHourOptions(openTime);
                        const filteredMinuteOptions = getFilteredCloseMinuteOptions(
                          openTime,
                          currentCloseHour
                        );

                        return (
                          <div className="flex gap-2">
                            {/* Hours */}
                            <Select
                              value={currentCloseHour.toString()}
                              onValueChange={(hours) => {
                                const currentMinutes = timeToMinutes(Number(field.value) || 0);
                                field.onChange(hoursMinutesToTime(parseInt(hours), currentMinutes));
                              }}
                              disabled={!isOpen}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="--" />
                              </SelectTrigger>
                              <SelectContent>
                                {filteredHourOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value.toString()}>
                                    {option.label}h
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Select
                              value={timeToMinutes(Number(field.value) || 0).toString()}
                              onValueChange={(minutes) => {
                                const currentHours = timeToHours(Number(field.value) || 0);
                                field.onChange(hoursMinutesToTime(currentHours, parseInt(minutes)));
                              }}
                              disabled={!isOpen}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="--" />
                              </SelectTrigger>
                              <SelectContent>
                                {filteredMinuteOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value.toString()}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        );
                      }}
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
            </div>
          );
        })}
      </div>
    </div>
  );
};
