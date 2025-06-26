"use server";

import { KiosqFormValues } from "@/features/kiosq-form-drawer/utils/kiosq-form-validation-schema";
import { InsertWithLocale } from "@/types/app";
import { createClient } from "@/utils/supabase/server";
import { geocodeAddressWithFallback } from "@/utils/geocoding";

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
      status: kiosq.status,
      is_default: kiosq.is_default,
      image_url: kiosq.image_url || null,
      profile_id: profile.id,
    })
    .select()
    .single();

  if (kiosqError) {
    throw kiosqError;
  }

  return kiosqData;
};
