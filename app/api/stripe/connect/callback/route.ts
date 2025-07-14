import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  // Extract parameters from the callback URL
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Handle errors from Stripe OAuth flow
  if (error) {
    return redirect("/dashboard/settings?stripe_error=true");
  }

  // Validate required parameters
  if (!code || !state) {
    return redirect("/dashboard/settings?stripe_error=true");
  }

  try {
    // Verify state parameter to prevent CSRF attacks
    const storedState = request.cookies.get("stripe_connect_state")?.value;
    if (!storedState || storedState !== state) {
      return redirect("/dashboard/settings?stripe_error=true");
    }

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return redirect("/dashboard/settings?stripe_error=true");
    }

    // Fetch the vendor profile with default kiosq
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select(
        `
        *,
        kiosqs:kiosqs!inner(
          address,
          city,
          state,
          country,
          is_default
        )
      `
      )
      .eq("type", "vendor")
      .eq("user_id", user.id)
      .eq("kiosqs.is_default", true);

    if (profileError || !profileData) {
      return redirect("/dashboard/settings?stripe_error=true");
    }

    // Exchange authorization code for Stripe account ID
    const tokenResponse = await fetch("https://connect.stripe.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${process.env.STRIPE_SECRET_API_KEY}`,
      },
      body: new URLSearchParams({
        client_secret: process.env.STRIPE_SECRET_API_KEY!,
        code,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      return redirect("/dashboard/settings?stripe_error=true");
    }

    const tokenData = await tokenResponse.json();
    const stripeAccountId = tokenData.stripe_user_id;

    if (!stripeAccountId) {
      return redirect("/dashboard/settings?stripe_error=true");
    }

    // Update the vendor profile with the Stripe account ID
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ stripe_account_id: stripeAccountId })
      .eq("user_id", user.id)
      .eq("type", "vendor");

    if (updateError) {
      return redirect("/dashboard/settings?stripe_error=true");
    }

    // Success: clear the state cookie and redirect to settings
    const response = NextResponse.redirect(
      new URL("/dashboard/settings?stripe_connected=true", request.url)
    );
    response.cookies.delete("stripe_connect_state");

    return response;
  } catch {
    return redirect("/dashboard/settings?stripe_error=true");
  }
}
