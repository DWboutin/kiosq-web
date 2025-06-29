import { z } from "zod";
import { Locales } from "@/types/app";

export type PauseItem = {
  start: string;
  end: string;
};

export type ScheduleFormValues = {
  timezone: string;
  monday_is_open: boolean;
  monday_open_time: number;
  monday_close_time: number;
  monday_pauses: PauseItem[];
  tuesday_is_open: boolean;
  tuesday_open_time: number;
  tuesday_close_time: number;
  tuesday_pauses: PauseItem[];
  wednesday_is_open: boolean;
  wednesday_open_time: number;
  wednesday_close_time: number;
  wednesday_pauses: PauseItem[];
  thursday_is_open: boolean;
  thursday_open_time: number;
  thursday_close_time: number;
  thursday_pauses: PauseItem[];
  friday_is_open: boolean;
  friday_open_time: number;
  friday_close_time: number;
  friday_pauses: PauseItem[];
  saturday_is_open: boolean;
  saturday_open_time: number;
  saturday_close_time: number;
  saturday_pauses: PauseItem[];
  sunday_is_open: boolean;
  sunday_open_time: number;
  sunday_close_time: number;
  sunday_pauses: PauseItem[];
};

const pauseItemSchema = z.object({
  start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
});

const pausesArraySchema = z.array(pauseItemSchema).max(3, "Maximum 3 pauses allowed per day");

export const createScheduleFormSchema = (locale: Locales, t: (key: string) => string) => {
  return z.object({
    timezone: z.string().min(1, t("ScheduleForm.validationTimezoneRequired")),
    monday_is_open: z.boolean(),
    monday_open_time: z.number().min(0).max(23),
    monday_close_time: z.number().min(0).max(23),
    monday_pauses: pausesArraySchema,
    tuesday_is_open: z.boolean(),
    tuesday_open_time: z.number().min(0).max(23),
    tuesday_close_time: z.number().min(0).max(23),
    tuesday_pauses: pausesArraySchema,
    wednesday_is_open: z.boolean(),
    wednesday_open_time: z.number().min(0).max(23),
    wednesday_close_time: z.number().min(0).max(23),
    wednesday_pauses: pausesArraySchema,
    thursday_is_open: z.boolean(),
    thursday_open_time: z.number().min(0).max(23),
    thursday_close_time: z.number().min(0).max(23),
    thursday_pauses: pausesArraySchema,
    friday_is_open: z.boolean(),
    friday_open_time: z.number().min(0).max(23),
    friday_close_time: z.number().min(0).max(23),
    friday_pauses: pausesArraySchema,
    saturday_is_open: z.boolean(),
    saturday_open_time: z.number().min(0).max(23),
    saturday_close_time: z.number().min(0).max(23),
    saturday_pauses: pausesArraySchema,
    sunday_is_open: z.boolean(),
    sunday_open_time: z.number().min(0).max(23),
    sunday_close_time: z.number().min(0).max(23),
    sunday_pauses: pausesArraySchema,
  });
};
