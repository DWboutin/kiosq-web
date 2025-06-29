"use server";

import { ScheduleFormValues } from "@/features/schedule-form-drawer/utils/schedule-form-validation-schema";
import { InsertWithLocale } from "@/types/app";
import { createClient } from "@/utils/supabase/server";
import { revalidateTag } from "next/cache";
import { cacheKeys } from "@/utils/cache-keys";

interface UpdateScheduleArgs {
  profileId: string;
  scheduleId: string;
  scheduleData: InsertWithLocale<ScheduleFormValues>;
}

export const updateSchedule = async ({
  profileId,
  scheduleId,
  scheduleData,
}: UpdateScheduleArgs) => {
  const supabase = await createClient();

  const { data: user, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }
  if (!user) {
    throw new Error("User not found");
  }

  // If this schedule is being set as default, update all other schedules to not be default
  if (scheduleData.is_default) {
    const { error: updateError } = await supabase
      .from("schedules")
      .update({ is_default: false })
      .eq("is_default", true)
      .eq("profile_id", profileId)
      .neq("id", scheduleId); // Don't update the current schedule

    if (updateError) {
      throw updateError;
    }
  }

  const schedulePayload = {
    name_translations: {
      [scheduleData.locale]: scheduleData.name,
      ...scheduleData.name_translations,
    },
    is_default: scheduleData.is_default,
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

  const { data: updatedSchedule, error: updateError } = await supabase
    .from("schedules")
    .update(schedulePayload)
    .eq("id", scheduleId)
    .eq("profile_id", profileId) // Ensure user can only update their own schedules
    .select()
    .single();

  if (updateError) {
    console.log("updateError", updateError);
    throw updateError;
  }

  // Revalidate cache
  revalidateTag(cacheKeys.currentUserSchedules.list(profileId).tag);

  return updatedSchedule;
};
