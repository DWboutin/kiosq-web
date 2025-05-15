import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export const verifyOtpCode = async (email: string, code: string) => {
  try {
    const supabase = createClient();

    const { data, error } = await supabase.auth.verifyOtp({
      email: email as string,
      token: code,
      type: "email",
    });

    if (error) {
      throw error;
    }

    return data.session;
  } catch (err) {
    console.error("Unexpected error in OTP code verification:", err);
  }
};

export const signInWithOtp = async (email: string) => {
  try {
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email: email as string,
    });

    if (error) {
      throw error;
    }
  } catch (err) {
    throw err;
  }
};

export const signOut = async () => {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
};
