import { Link } from "@/i18n/navigation";
import { DashboardLink } from "@/utils/dashboard-navigation";
import React from "react";
import { useTranslations } from "next-intl";
import classNames from "classnames";

export const DashboardBreadcrumbLink = ({
  link,
  isLast,
}: {
  link: DashboardLink;
  isLast: boolean;
}) => {
  const t = useTranslations();

  if (isLast) {
    return (
      <span className="flex flex-row items-center gap-2 flex-shrink-0 text-brand-medium cursor-default">
        {link.icon}
        <span className="font-inter font-semibold">{t(link.labelKey)}</span>
      </span>
    );
  }

  return (
    <Link
      className="flex flex-row items-center gap-2 hover:underline flex-shrink-0"
      href={t(link.pathKey)}
      aria-current={isLast ? "page" : undefined}
    >
      {link.icon}
      <span className="font-inter font-semibold">{t(link.labelKey)}</span>
    </Link>
  );
};
