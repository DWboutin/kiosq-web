"use server";

import { KiosqFormValues } from "@/features/kiosq-form-drawer/utils/kiosq-form-validation-schema";
import { InsertWithLocale } from "@/types/app";
import { createClient } from "@/utils/supabase/server";
import { geocodeAddressWithFallback } from "@/utils/geocoding";
import { kiosqsRevalidator } from "@/actions/revalidators/kiosqs-revalidator";

type CreateKiosqArgs = InsertWithLocale<KiosqFormValues>;

export const createKiosq = async (kiosq: CreateKiosqArgs) => {
  const supabase = await createClient();

  const { data: user, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }
  if (!user) {
    throw new Error("User not found");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("type", "vendor")
    .eq("user_id", user.user.id)
    .single();

  if (profileError) {
    throw profileError;
  }
  if (!profile) {
    throw new Error("Profile not found");
  }

  // Check if user already has kiosqs to determine if this should be default
  const { data: defaultKiosqs, error: defaultKiosqsError } = await supabase
    .from("kiosqs")
    .select("id")
    .eq("is_default", true)
    .eq("profile_id", profile.id);

  if (defaultKiosqsError) {
    throw defaultKiosqsError;
  }

  // If this is the first kiosq, make it default regardless of the input
  const shouldBeDefault = !defaultKiosqs || defaultKiosqs.length === 0 ? true : kiosq.isDefault;

  if (shouldBeDefault) {
    const { error: updateError } = await supabase
      .from("kiosqs")
      .update({ is_default: false })
      .eq("is_default", true)
      .eq("profile_id", profile.id);

    if (updateError) {
      throw updateError;
    }
  }

  // Geocode the address to get latitude and longitude
  const geocodeResult = await geocodeAddressWithFallback(
    kiosq.address,
    kiosq.city,
    kiosq.state,
    kiosq.country
  );

  const { data: kiosqData, error: kiosqError } = await supabase
    .from("kiosqs")
    .insert({
      name_translations: {
        [kiosq.locale]: kiosq.name,
        ...kiosq.name_translations,
      },
      description_translations: kiosq.description
        ? {
            [kiosq.locale]: kiosq.description,
            ...kiosq.description_translations,
          }
        : {},
      address: kiosq.address,
      city: kiosq.city,
      state: kiosq.state,
      country: kiosq.country,
      latitude: geocodeResult?.latitude || null,
      longitude: geocodeResult?.longitude || null,
      store_status: kiosq.storeStatus,
      schedule_id: kiosq.scheduleId || null,
      is_default: shouldBeDefault,
      image_url: kiosq.imageUrl || null,
      profile_id: profile.id,
    })
    .select()
    .single();

  if (kiosqError) {
    throw kiosqError;
  }

  kiosqsRevalidator({ profileId: profile.id });

  return kiosqData;
};
