"use server";

import { ScheduleFormValues } from "@/features/schedule-form-drawer/utils/schedule-form-validation-schema";
import { InsertWithLocale } from "@/types/app";
import { createClient } from "@/utils/supabase/server";
import { scheduleRevalidator } from "@/actions/revalidators/shedules-revalidator";

interface CreateScheduleArgs {
  profileId: string;
  scheduleData: InsertWithLocale<ScheduleFormValues>;
}

export const createSchedule = async ({ profileId, scheduleData }: CreateScheduleArgs) => {
  const supabase = await createClient();

  const { data: user, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }
  if (!user) {
    throw new Error("User not found");
  }

  // Check if user already has schedules to determine if this should be default
  const { data: defaultSchedules, error: defaultSchedulesError } = await supabase
    .from("schedules")
    .select("id")
    .eq("is_default", true)
    .eq("profile_id", profileId);

  if (defaultSchedulesError) {
    throw defaultSchedulesError;
  }

  // If this is the first schedule, make it default regardless of the input
  const shouldBeDefault =
    !defaultSchedules || defaultSchedules.length === 0 ? true : scheduleData.is_default;

  if (shouldBeDefault) {
    const { error: updateError } = await supabase
      .from("schedules")
      .update({ is_default: false })
      .eq("is_default", true)
      .eq("profile_id", profileId);

    if (updateError) {
      throw updateError;
    }
  }

  const schedulePayload = {
    profile_id: profileId,
    name_translations: {
      [scheduleData.locale]: scheduleData.name,
      ...scheduleData.name_translations,
    },
    is_default: shouldBeDefault,
    timezone: scheduleData.timezone,

    // Monday
    monday_is_open: scheduleData.monday_is_open,
    monday_open_time: scheduleData.monday_open_time,
    monday_close_time: scheduleData.monday_close_time,
    monday_pauses: scheduleData.monday_pauses,

    // Tuesday
    tuesday_is_open: scheduleData.tuesday_is_open,
    tuesday_open_time: scheduleData.tuesday_open_time,
    tuesday_close_time: scheduleData.tuesday_close_time,
    tuesday_pauses: scheduleData.tuesday_pauses,

    // Wednesday
    wednesday_is_open: scheduleData.wednesday_is_open,
    wednesday_open_time: scheduleData.wednesday_open_time,
    wednesday_close_time: scheduleData.wednesday_close_time,
    wednesday_pauses: scheduleData.wednesday_pauses,

    // Thursday
    thursday_is_open: scheduleData.thursday_is_open,
    thursday_open_time: scheduleData.thursday_open_time,
    thursday_close_time: scheduleData.thursday_close_time,
    thursday_pauses: scheduleData.thursday_pauses,

    // Friday
    friday_is_open: scheduleData.friday_is_open,
    friday_open_time: scheduleData.friday_open_time,
    friday_close_time: scheduleData.friday_close_time,
    friday_pauses: scheduleData.friday_pauses,

    // Saturday
    saturday_is_open: scheduleData.saturday_is_open,
    saturday_open_time: scheduleData.saturday_open_time,
    saturday_close_time: scheduleData.saturday_close_time,
    saturday_pauses: scheduleData.saturday_pauses,

    // Sunday
    sunday_is_open: scheduleData.sunday_is_open,
    sunday_open_time: scheduleData.sunday_open_time,
    sunday_close_time: scheduleData.sunday_close_time,
    sunday_pauses: scheduleData.sunday_pauses,

    updated_at: new Date().toISOString(),
  };

  const { data: newSchedule, error: insertError } = await supabase
    .from("schedules")
    .insert({
      ...schedulePayload,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    console.log("insertError", insertError);
    throw insertError;
  }

  scheduleRevalidator({ profileId });

  return newSchedule;
};
