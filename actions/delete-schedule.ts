"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidateTag } from "next/cache";
import { cacheKeys } from "@/utils/cache-keys";

export type DeleteScheduleParams = {
  scheduleId: string;
};

export const deleteSchedule = async (params: DeleteScheduleParams) => {
  const supabase = await createClient();

  const { scheduleId } = params;

  const { data: user, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user.user) {
    throw new Error("User not found");
  }

  // Get schedule data to verify ownership and check if it's default
  const { data: scheduleData, error: scheduleError } = await supabase
    .from("schedules")
    .select("id, profile_id, is_default")
    .eq("id", scheduleId)
    .single();

  if (scheduleError) {
    console.error("Error fetching schedule data:", scheduleError);
    throw scheduleError;
  }

  // Prevent deletion of default schedule
  if (scheduleData.is_default) {
    throw new Error("Cannot delete default schedule");
  }

  // Verify user owns this schedule
  const { data: userProfile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.user.id)
    .eq("type", "vendor")
    .single();

  if (profileError || !userProfile) {
    throw new Error("User profile not found");
  }

  if (scheduleData.profile_id !== userProfile.id) {
    throw new Error("Unauthorized: You don't own this schedule");
  }

  // Delete the schedule
  const { error: deleteError } = await supabase.from("schedules").delete().eq("id", scheduleId);

  if (deleteError) {
    console.error("Error deleting schedule:", deleteError);
    throw deleteError;
  }

  // Revalidate cache
  revalidateTag(cacheKeys.currentUserSchedules.list(userProfile.id).tag);

  return { success: true, deletedScheduleId: scheduleId };
};
