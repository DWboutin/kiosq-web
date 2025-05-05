import { useMemo } from "react";
import {
  DASHBOARD_ADMIN_TABS,
  DASHBOARD_UTILS_LINKS,
  DashboardLink,
} from "@/utils/dashboard-navigation";
import { DASHBOARD_LINKS } from "@/utils/dashboard-navigation";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";

export const usePathLinks = (): DashboardLink[] => {
  const pathname = usePathname();
  const t = useTranslations();

  return useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);

    return segments
      .reduce<{ path: string; link: DashboardLink | undefined }[]>((acc, segment, index) => {
        const currentPath = `/${segments.slice(0, index + 1).join("/")}`;

        const link =
          Object.values(DASHBOARD_LINKS).find((link) => t(link.pathKey) === currentPath) ||
          Object.values(DASHBOARD_UTILS_LINKS).find((link) => t(link.pathKey) === currentPath) ||
          Object.values(DASHBOARD_ADMIN_TABS).find((link) => t(link.pathKey) === currentPath);

        acc.push({ path: currentPath, link });
        return acc;
      }, [])
      .filter((item) => item.link)
      .map((item) => item.link as DashboardLink);
  }, [pathname, t]);
};
