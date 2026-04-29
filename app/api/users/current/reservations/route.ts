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

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user:", userError);
      return NextResponse.json(
        { error: "Error fetching user", details: userError?.message },
        { status: 500 }
      );
    }

    // First, get the vendor profile IDs that belong to the current user
    const { data: userProfileIds, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userData?.id);

    if (profileError) {
      console.error("Error fetching user profiles:", profileError);
      return NextResponse.json(
        { error: "Error fetching user profiles", details: profileError.message },
        { status: 500 }
      );
    }

    const userProfileIdList = userProfileIds?.map((profile) => profile.id) || [];

    // Build the OR condition based on whether user has profiles
    let orCondition;
    if (userProfileIdList.length > 0) {
      orCondition = `customer_id.eq.${userData?.id},vendor_profile_id.in.(${userProfileIdList
        .map((id) => `"${id}"`)
        .join(",")})`;
    } else {
      orCondition = `customer_id.eq.${userData?.id}`;
    }

    // Fetch reservations for the current user, including order, order_items, kiosqs, and profiles
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
          user_id,
          name_translations,
          slug_translations,
          description_translations,
          banner_image,
          type,
          stripe_account_id
        )
      `
      )
      .or(orCondition)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (reservationsError) {
      console.error("Error fetching reservations:", reservationsError);
      return NextResponse.json(
        { error: "Error fetching reservations", details: reservationsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reservations: authenticatedUserReservationsFactory(reservations, userData.id),
    });
  } catch (error) {
    console.error("Unexpected error in reservations API:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
};
