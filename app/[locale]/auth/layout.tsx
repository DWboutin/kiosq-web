import { KiosqLogo } from "@/components/ui/kiosq-logo/kiosq-logo";
import { LocaleDropdown } from "@/features/locale-dropdown/locale-dropdown";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations();

  return (
    <div className="min-h-screen flex">
      <div className="min-md:w-2/3 max-md:pb-10 w-full min-h-screen bg-brand-gradient">
        <div className="flex flex-col gap-10 p-5 h-full">
          <div className="flex flex-row items-center justify-between">
            <Link
              href="/"
              aria-label={t("Header.logoLinkAriaLabel")}
              className="flex flex-row items-center gap-2"
            >
              <KiosqLogo inverted />
              <span className="text-xl font-lato text-neutral-white">kiosq</span>
            </Link>
            <LocaleDropdown className="text-neutral-white hover:text-neutral-light" />
          </div>
          {children}
        </div>
      </div>
      <div className="fixed right-0 top-0 w-1/3 min-h-screen bg-neutral-lightest overflow-hidden max-md:hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/farmer-sign-in-image.png"
            alt={t("SignIn.farmerImageAlt")}
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute bottom-0 right-0 z-10 p-5">
          <div className="flex flex-col text-right rounded-lg backdrop-blur-sm bg-black/30 p-3">
            <h2 className="text-2xl font-nunito text-neutral-white font-bold">
              {t("SignIn.slogan")}
            </h2>
            <p className="text-base font-nunito text-neutral-white font-medium">
              {t("SignIn.sloganDescription")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
