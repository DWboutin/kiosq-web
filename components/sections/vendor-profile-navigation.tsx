"use client";

import { DynamicLink } from "@/components/ui/dynamic-link";
import { cn } from "@/lib/utils";
import { Locales } from "@/types/app";
import { useTranslations } from "next-intl";

type VendorProfileNavigationProps = {
  slug: string;
  locale: Locales;
};

type VendorProfileNavigationLinkProps = {
  slug: string;
  locale: Locales;
  pathKey: string;
  children: React.ReactNode;
};

const vendorProfileNavigationLinks = [
  {
    pathKey: "Pathnames.vendor_slug",
    label: "ourProducts",
  },
  {
    pathKey: "Pathnames.vendor_slug_company",
    label: "ourCompany",
  },
  {
    pathKey: "Pathnames.vendor_slug_schedule",
    label: "schedule",
  },
  {
    pathKey: "Pathnames.vendor_slug_events",
    label: "events",
  },
];

const vendorProfileNavigationLinkClassName = "text-neutral-darker hover:text-neutral-black";
const vendorProfileNavigationLinkLargeClassName =
  "min-md:font-medium min-md:py-4 min-md:px-3 min-md:border-b-4 min-md:border-transparent min-md:hover:border-neutral-light";
const vendorProfileNavigationLinkSmallClassName =
  "max-md:text-sm max-md:font-semibold max-md:py-2 max-md:px-3 max-md:rounded-full";

const VendorProfileNavigationLink = ({
  slug,
  locale,
  pathKey,
  children,
}: VendorProfileNavigationLinkProps) => {
  return (
    <DynamicLink
      pathKey={pathKey}
      id={slug}
      key={`${slug}-${locale}`}
      className={cn(
        vendorProfileNavigationLinkClassName,
        vendorProfileNavigationLinkLargeClassName,
        vendorProfileNavigationLinkSmallClassName
      )}
      activeClassName="min-md:border-brand-medium min-md:hover:border-brand-medium max-md:bg-neutral-lightest"
    >
      {children}
    </DynamicLink>
  );
};

export const VendorProfileNavigation = ({ slug, locale }: VendorProfileNavigationProps) => {
  const t = useTranslations("VendorPageNavigation");

  return (
    <div className="container mx-auto max-sm:px-4">
      <div className="flex flex-row max-md:gap-2">
        {vendorProfileNavigationLinks.map((link) => (
          <VendorProfileNavigationLink
            slug={slug}
            locale={locale}
            pathKey={link.pathKey}
            key={link.pathKey}
          >
            {t(link.label)}
          </VendorProfileNavigationLink>
        ))}
      </div>
    </div>
  );
};
