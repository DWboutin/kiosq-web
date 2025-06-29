"use client";

import { CloseIcon } from "@/components/ui/icons/close-icon";
import { PlusSquareIcon } from "@/components/ui/icons/plus-square-icon";
import { ButtonBrand } from "@/components/ui/button-brand";
import { FormInputContainer } from "@/components/ui/form-utils/form-input-container";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { FC } from "react";
import { Control, Controller, FieldErrors, useFieldArray, FieldPath } from "react-hook-form";
import { ScheduleFormValues } from "@/features/schedule-form-drawer/utils/schedule-form-validation-schema";

type PauseFieldName =
  | "monday_pauses"
  | "tuesday_pauses"
  | "wednesday_pauses"
  | "thursday_pauses"
  | "friday_pauses"
  | "saturday_pauses"
  | "sunday_pauses";

type SchedulePauseTimesProps = {
  day: string;
  control: Control<ScheduleFormValues>;
  errors: FieldErrors<ScheduleFormValues>;
  disabled?: boolean;
};

// Hour options (0-23)
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: i.toString().padStart(2, "0"),
  label: i.toString().padStart(2, "0"),
}));

// Minute options (0, 15, 30, 45)
const MINUTE_OPTIONS = [
  { value: "00", label: "00" },
  { value: "15", label: "15" },
  { value: "30", label: "30" },
  { value: "45", label: "45" },
];

export const SchedulePauseTimes: FC<SchedulePauseTimesProps> = ({
  day,
  control,
  errors,
  disabled = false,
}) => {
  const t = useTranslations("ScheduleForm");

  const fieldName = `${day}_pauses` as PauseFieldName;

  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldName,
  });

  const addPause = () => {
    if (fields.length < 3) {
      append({ start: "12:00", end: "13:00" });
    }
  };

  const getFieldError = (index: number, field: "start" | "end"): string | undefined => {
    const fieldErrors = errors[fieldName];
    if (Array.isArray(fieldErrors) && fieldErrors[index]) {
      const indexError = fieldErrors[index] as Record<string, { message?: string }>;
      return indexError[field]?.message;
    }
    return undefined;
  };

  const parseTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    return { hours, minutes };
  };

  const formatTime = (hours: string, minutes: string) => {
    return `${hours}:${minutes}`;
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="text-sm font-medium">{t("pauseTimes")}</div>
          <p className="text-xs text-neutral-600">{t("pauseTimesDescription")}</p>
        </div>
        <ButtonBrand
          type="button"
          variant="outline"
          size="sm"
          onClick={addPause}
          disabled={disabled || fields.length >= 3}
        >
          <PlusSquareIcon className="size-4 mr-2" />
          {t("addPause")}
        </ButtonBrand>
      </div>

      <div className="flex flex-col gap-3">
        {fields.map((field, index) => (
          <div key={field.id} className="border rounded-lg p-3 bg-gray-50">
            <div className="flex items-end gap-2">
              <div className="flex-1 grid grid-cols-2 gap-4">
                {/* Start Time */}
                <div className="space-y-2">
                  <FormInputContainer
                    inputId={`${day}_pause_${index}_start`}
                    label={t("startTime")}
                    error={getFieldError(index, "start")}
                  >
                    <div className="flex flex-row gap-2">
                      <Controller
                        name={`${fieldName}.${index}.start` as FieldPath<ScheduleFormValues>}
                        control={control}
                        render={({ field: controllerField }) => {
                          const { hours, minutes } = parseTime(String(controllerField.value));
                          return (
                            <>
                              <Select
                                value={hours}
                                onValueChange={(newHours) => {
                                  controllerField.onChange(formatTime(newHours, minutes));
                                }}
                                disabled={disabled}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="HH" />
                                </SelectTrigger>
                                <SelectContent>
                                  {HOUR_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Select
                                value={minutes}
                                onValueChange={(newMinutes) => {
                                  controllerField.onChange(formatTime(hours, newMinutes));
                                }}
                                disabled={disabled}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="MM" />
                                </SelectTrigger>
                                <SelectContent>
                                  {MINUTE_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </>
                          );
                        }}
                      />
                    </div>
                  </FormInputContainer>
                </div>

                {/* End Time */}
                <div className="space-y-2">
                  <FormInputContainer
                    inputId={`${day}_pause_${index}_end`}
                    label={t("endTime")}
                    error={getFieldError(index, "end")}
                  >
                    <div className="flex flex-row gap-2">
                      <Controller
                        name={`${fieldName}.${index}.end` as FieldPath<ScheduleFormValues>}
                        control={control}
                        render={({ field: controllerField }) => {
                          const { hours, minutes } = parseTime(String(controllerField.value));
                          return (
                            <>
                              <Select
                                value={hours}
                                onValueChange={(newHours) => {
                                  controllerField.onChange(formatTime(newHours, minutes));
                                }}
                                disabled={disabled}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="HH" />
                                </SelectTrigger>
                                <SelectContent>
                                  {HOUR_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Select
                                value={minutes}
                                onValueChange={(newMinutes) => {
                                  controllerField.onChange(formatTime(hours, newMinutes));
                                }}
                                disabled={disabled}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="MM" />
                                </SelectTrigger>
                                <SelectContent>
                                  {MINUTE_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </>
                          );
                        }}
                      />
                    </div>
                  </FormInputContainer>
                </div>
              </div>

              {/* Remove Button */}
              <ButtonBrand
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                disabled={disabled}
                className="mb-1"
              >
                <CloseIcon className="size-4" />
              </ButtonBrand>
            </div>
          </div>
        ))}
      </div>

      {fields.length === 0 && <p className="text-xs text-gray-500 italic">{t("noPauses")}</p>}

      {fields.length >= 3 && <p className="text-xs text-amber-600">{t("maxPausesReached")}</p>}
    </div>
  );
};
