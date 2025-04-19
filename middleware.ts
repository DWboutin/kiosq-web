import { type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { updateSession } from "@/utils/supabase/middleware";
import { AppConfig } from "@/app-config";

export async function middleware(request: NextRequest) {
  // First, check authentication
  const authResponse = await updateSession(request);

  // If authentication check resulted in a redirect, return it immediately
  if (authResponse.headers.has("Location")) {
    return authResponse;
  }

  // Otherwise, handle i18n routing
  const handleI18nRouting = createIntlMiddleware({
    locales: AppConfig.locales,
    defaultLocale: AppConfig.defaultLocale,
    localePrefix: AppConfig.localePrefix as "always" | "as-needed" | "never",
  });

  return handleI18nRouting(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
