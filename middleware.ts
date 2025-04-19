import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { updateSession } from "@/utils/supabase/middleware";
import { AppConfig } from "@/app-config";

export async function middleware(request: NextRequest) {
  const handleI18nRouting = createIntlMiddleware({
    locales: AppConfig.locales,
    defaultLocale: AppConfig.defaultLocale,
    localePrefix: AppConfig.localePrefix as "always" | "as-needed" | "never",
  });
  const res = handleI18nRouting(request);

  if (res instanceof NextResponse) {
    return res;
  }

  return await updateSession(res);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
