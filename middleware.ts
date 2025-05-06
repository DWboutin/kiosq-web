import { type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { updateSession } from "@/utils/supabase/middleware";
import { AppConfig } from "@/app-config";
import { Locales } from "@/types/app";
import { createPathnamesMappings } from "@/i18n/create-pathnames-mappings";

const pathnames = createPathnamesMappings();
const handleI18nRouting = createIntlMiddleware({
  locales: AppConfig.locales,
  defaultLocale: AppConfig.defaultLocale as Locales,
  localePrefix: AppConfig.localePrefix as "always" | "as-needed" | "never",
  pathnames,
});

export async function middleware(request: NextRequest) {
  // First, check authentication
  const authResponse = await updateSession(request);

  // If authentication check resulted in a redirect, return it immediately
  if (authResponse.headers.has("Location")) {
    return authResponse;
  }

  return handleI18nRouting(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
