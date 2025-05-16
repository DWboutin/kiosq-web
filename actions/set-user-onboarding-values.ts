"use server";

import { UserOnboardingValues } from "@/features/user-onboarding/utils/create-user-onboarding-schema";
import { createClient } from "@/utils/supabase/server";

export const setUserOnboardingValues = async (values: UserOnboardingValues) => {
  try {
    const supabase = await createClient();

    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }
    if (!user) {
      throw new Error("User not found");
    }

    const { error: updateAuthError } = await supabase.auth.updateUser({
      data: {
        display_name: values.displayName,
      },
    });

    if (updateAuthError) {
      throw new Error(updateAuthError.message);
    }

    const { data, error } = await supabase
      .from("users")
      .update({
        first_name: values.firstName,
        last_name: values.lastName,
        postal_code: values.postalCode,
        latitude: values.geolocation?.latitude,
        longitude: values.geolocation?.longitude,
        interests: values.categories,
        search_radius: values.searchRadius,
        is_onboarded: true,
      })
      .eq("id", user.user.id)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
