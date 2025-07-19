import { authenticatedUserReservationsFactory } from "@/utils/factories/authenticated-user-reservations-factory";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch reservations for the current user, including order, order_items, kiosqs, profiles, and customer info
    const { data: reservations, error: reservationsError } = await supabase
      .from("reservations")
      .select(
        `*,
        orders:orders!reservation_id(*,
          order_items:order_items(*)),
        kiosqs:kiosq_id(
          id,
          name_translations,
          description_translations,
          address,
          city,
          state,
          country,
          latitude,
          longitude,
          image_url,
          status,
          is_default
        ),
        profiles:vendor_profile_id(
          id,
          name_translations,
          slug_translations,
          description_translations,
          banner_image,
          type,
          stripe_account_id
        ),
        customers:customer_id(
          id,
          email,
          display_name,
          first_name,
          last_name,
          postal_code,
          latitude,
          longitude,
          search_radius,
          interests,
          is_onboarded,
          role
        )
      `
      )
      .eq("customer_id", user.id)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (reservationsError) {
      console.error("Error fetching reservations:", reservationsError);
      return NextResponse.json(
        { error: "Error fetching reservations", details: reservationsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ reservations: authenticatedUserReservationsFactory(reservations) });
  } catch (error) {
    console.error("Unexpected error in reservations API:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
};
