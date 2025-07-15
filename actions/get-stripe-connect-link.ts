"use server";

import { Locales } from "@/types/app";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function getStripeConnectLink({ locale }: { locale: Locales }) {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthorized");
  }

  try {
    // Get the user's vendor profile with default kiosq
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select(
        `
        *,
        kiosqs!kiosqs_profile_id_fkey(
          id,
          address,
          city,
          state,
          country,
          is_default
        )
      `
      )
      .eq("user_id", user.id)
      .eq("type", "vendor")
      .limit(1)
      .single();

    if (profileError) {
      throw new Error("Failed to fetch vendor profile");
    }

    if (!profiles) {
      throw new Error("No vendor profile found");
    }

    type KiosqData = {
      id: string;
      address: string | null;
      city: string | null;
      state: string | null;
      country: string | null;
      postal_code: string | null;
      is_default: boolean | null;
    };
    const defaultKiosq: KiosqData | undefined =
      profiles.kiosqs?.find((kiosq: KiosqData) => kiosq.is_default) || profiles.kiosqs?.[0];

    if (!defaultKiosq) {
      throw new Error("No kiosq found for vendor profile");
    }

    // Generate state parameter for CSRF protection
    const state = Buffer.from(user.id).toString("base64");
    // Store the state in a cookie for later verification in the callback
    const cookieStore = await cookies();
    cookieStore.set("stripe_connect_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 30, // 30 minutes
    });

    // Construct Stripe Connect OAuth URL with additional metadata
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID || "",
      state,
      response_type: "code",
      redirect_uri: `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/stripe/connect/callback`,
      scope: "read_write",
      // Additional metadata
      "stripe_user[country]": defaultKiosq.country || "",
      "stripe_user[state]": defaultKiosq.state || "",
      "stripe_user[business_name]": profiles.name_translations[locale] || "",
      "business_profile[product_description]": profiles.description_translations[locale] || "",
      "business_profile[url]": profiles.slug_translations.en
        ? `https://market.kiosq.app/${profiles.slug_translations.en}`
        : "",
      "stripe_user[city]": defaultKiosq.city || "",
      "stripe_user[zip]": defaultKiosq.postal_code || "",
      "stripe_user[street_address]": defaultKiosq.address || "",
      // Custom metadata that will be passed through
      "stripe_user[profile_id]": profiles.id,
      "stripe_user[user_id]": user.id,
      "stripe_user[email]": user.email || "",
    });

    const stripeConnectUrl = `https://connect.stripe.com/oauth/authorize?${params}`;

    return {
      connectUrl: stripeConnectUrl,
      state,
      profileId: profiles.id,
      userId: user.id,
      kiosqId: defaultKiosq.id,
    };
  } catch (error) {
    console.error("Error generating Stripe Connect link:", error);
    throw new Error("Failed to generate Stripe Connect link");
  }
}
