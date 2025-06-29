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
import { Control, Controller, FieldErrors, useFieldArray } from "react-hook-form";
import { ScheduleFormValues } from "@/features/schedule-form-drawer/utils/schedule-form-validation-schema";

type SchedulePauseTimesProps = {
  day: string;
  control: Control<ScheduleFormValues>;
  errors: FieldErrors<ScheduleFormValues>;
  disabled?: boolean;
};

// Time options in 15-minute intervals
const TIME_OPTIONS = Array.from({ length: 96 }, (_, i) => {
  const hours = Math.floor(i / 4);
  const minutes = (i % 4) * 15;
  const value = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  return { value, label: value };
});

export const SchedulePauseTimes: FC<SchedulePauseTimesProps> = ({
  day,
  control,
  errors,
  disabled = false,
}) => {
  const t = useTranslations("ScheduleForm");

  const fieldName = `${day}_pauses` as any;

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
    const fieldErrors = (errors as any)[fieldName];
    return fieldErrors?.[index]?.[field]?.message;
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
              <div className="flex-1 grid grid-cols-2 gap-2">
                {/* Start Time */}
                <FormInputContainer
                  inputId={`${day}_pause_${index}_start`}
                  label={t("startTime")}
                  error={getFieldError(index, "start")}
                >
                  <Controller
                    name={`${fieldName}.${index}.start` as any}
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={disabled}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormInputContainer>

                {/* End Time */}
                <FormInputContainer
                  inputId={`${day}_pause_${index}_end`}
                  label={t("endTime")}
                  error={getFieldError(index, "end")}
                >
                  <Controller
                    name={`${fieldName}.${index}.end` as any}
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={disabled}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormInputContainer>
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
