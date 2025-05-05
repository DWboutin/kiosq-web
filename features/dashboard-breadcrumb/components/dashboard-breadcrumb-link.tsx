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

  return (
    <Link
      className={classNames(
        "flex flex-row items-center gap-2 hover:underline flex-shrink-0",
        isLast && "text-brand-medium"
      )}
      href={t(link.pathKey)}
      aria-current={isLast ? "page" : undefined}
    >
      {link.icon}
      <span className="font-inter font-semibold">{t(link.labelKey)}</span>
    </Link>
  );
};
