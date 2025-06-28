"use server";

import { KiosqFormValues } from "@/features/kiosq-form-drawer/utils/kiosq-form-validation-schema";
import { InsertWithLocale } from "@/types/app";
import { createClient } from "@/utils/supabase/server";
import { geocodeAddressWithFallback } from "@/utils/geocoding";
import { revalidateTag } from "next/cache";
import { cacheKeys } from "@/utils/cache-keys";

type UpdateKiosqArgs = InsertWithLocale<KiosqFormValues> & { id: string };

export const updateKiosq = async (kiosq: UpdateKiosqArgs) => {
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

  // Geocode the address to get latitude and longitude
  const geocodeResult = await geocodeAddressWithFallback(
    kiosq.address,
    kiosq.city,
    kiosq.state,
    kiosq.country
  );

  // If setting this kiosq as default, first update all other kiosqs to not be default
  if (kiosq.is_default) {
    const { error: resetDefaultError } = await supabase
      .from("kiosqs")
      .update({ is_default: false })
      .eq("profile_id", profile.id)
      .neq("id", kiosq.id);

    if (resetDefaultError) {
      throw resetDefaultError;
    }
  }

  const { data: kiosqData, error: kiosqError } = await supabase
    .from("kiosqs")
    .update({
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
      status: kiosq.status,
      is_default: kiosq.is_default,
      image_url: kiosq.image_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", kiosq.id)
    .eq("profile_id", profile.id)
    .select()
    .single();

  if (kiosqError) {
    throw kiosqError;
  }

  revalidateTag(cacheKeys.currentUserKiosqById(kiosq.id).tag);

  return kiosqData;
};
