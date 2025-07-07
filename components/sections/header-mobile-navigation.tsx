"use client";

import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ButtonBrand } from "@/components/ui/button-brand";
import { MobileMenuIcon } from "@/components/ui/icons/mobile-menu-icon";
import { KiosqLogo } from "@/components/ui/kiosq-logo/kiosq-logo";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useProductCategories } from "@/hooks/use-product-categories";
import { useLocale } from "next-intl";
import { Locales } from "@/types/app";
import { CloseIcon } from "@/components/ui/icons/close-icon";
import { LOCALES } from "@/utils/constants";
import { usePathname } from "@/i18n/navigation";
import { useLocaleDropdownContext } from "@/features/locale-dropdown/locale-dropdown-provider";
import { useMemo } from "react";

export default function HeaderMobileNavigation() {
  const t = useTranslations();
  const locale = useLocale() as Locales;
  const pathname = usePathname();
  const { localizedPathnames } = useLocaleDropdownContext();
  const {
    selectors: { categories },
  } = useProductCategories();
  const parentCategories = categories?.filter((cat) => !cat.parentId) || [];

  // Get all locales except the current one for the accordion
  const otherLocales = useMemo(() => LOCALES.filter((l) => l !== locale), [locale]) as Locales[];

  return (
    <Drawer direction="left">
      <DrawerTrigger asChild>
        <ButtonBrand
          variant="ghost"
          size="icon"
          aria-label={t("Header.mobileMenuButtonAriaLabel")}
          className="min-md:hidden"
        >
          <MobileMenuIcon className="text-neutral-dark size-6" />
        </ButtonBrand>
      </DrawerTrigger>
      <DrawerContent className="w-full max-w-xs p-0 flex flex-col min-h-screen">
        <DrawerHeader className="border-b border-neutral-lightest flex flex-row items-center gap-2 py-4 max-md:pb-4">
          <>
            <div className="flex-1 flex flex-row items-center gap-2">
              <KiosqLogo />
              <span className="text-xl font-lato text-brand-medium">kiosq</span>
            </div>
            <DrawerClose asChild>
              <ButtonBrand variant="ghost" size="icon" aria-label={t("Global.cancel")}>
                <CloseIcon className="text-neutral-dark size-6" />
              </ButtonBrand>
            </DrawerClose>
          </>
        </DrawerHeader>
        <nav className="flex flex-col gap-2 p-4" aria-label="Mobile navigation">
          <Link
            href="/"
            aria-label={t("Header.logoLinkAriaLabel")}
            className="flex items-center gap-2 py-2 px-2 rounded-md text-base font-medium text-neutral-darker hover:bg-neutral-lightest focus-visible:ring-2 focus-visible:ring-brand-medium outline-none"
          >
            {t("Header.logoLinkAriaLabel")}
          </Link>

          <div className="mt-2">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="categories" className="border-b border-neutral-lightest">
                <AccordionTrigger className="flex items-center gap-2 py-2 px-2 rounded-md text-base font-medium text-neutral-darker hover:bg-neutral-lightest focus-visible:ring-2 focus-visible:ring-brand-medium outline-none hover:no-underline">
                  Categories
                </AccordionTrigger>
                <AccordionContent className="px-2 pb-2">
                  <div className="flex flex-col gap-1">
                    {parentCategories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/categories/${category.slug?.[locale] || category.id}`}
                        className="block py-2 px-2 rounded text-neutral-dark hover:bg-neutral-lightest focus-visible:ring-2 focus-visible:ring-brand-medium outline-none text-sm"
                      >
                        {category.name[locale]}
                      </Link>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="mt-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="languages" className="border-b border-neutral-lightest">
                <AccordionTrigger className="flex items-center gap-2 py-2 px-2 rounded-md text-base font-medium text-neutral-darker hover:bg-neutral-lightest focus-visible:ring-2 focus-visible:ring-brand-medium outline-none hover:no-underline">
                  Languages
                </AccordionTrigger>
                <AccordionContent className="px-2 pb-2">
                  <div className="flex flex-col gap-1">
                    {/* Current locale - shown but not clickable */}
                    <div className="block py-2 px-2 rounded text-neutral-dark bg-neutral-lightest text-sm font-medium">
                      {t(`Locales.${locale}`)} (Current)
                    </div>
                    {/* Other locales - clickable */}
                    {otherLocales.map((otherLocale) => (
                      <Link
                        key={otherLocale}
                        href={localizedPathnames?.[otherLocale] ?? pathname}
                        locale={otherLocale}
                        className="block py-2 px-2 rounded text-neutral-dark hover:bg-neutral-lightest focus-visible:ring-2 focus-visible:ring-brand-medium outline-none text-sm"
                      >
                        {t(`Locales.${otherLocale}`)}
                      </Link>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="mt-4">
            <Link
              href="/auth/sign-in"
              className="flex items-center gap-2 group py-2 px-2 rounded-md text-base font-medium text-neutral-darker hover:bg-neutral-lightest focus-visible:ring-2 focus-visible:ring-brand-medium outline-none"
            >
              {t("Header.connectionButton")}
            </Link>
          </div>
        </nav>
      </DrawerContent>
    </Drawer>
  );
}
