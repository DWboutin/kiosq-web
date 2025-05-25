import { useCallback, useMemo } from "react";
import {
  DASHBOARD_ADMIN_TABS,
  DASHBOARD_PRODUCT_ID,
  DASHBOARD_UTILS_LINKS,
  DASHBOARD_LINKS,
  DashboardLink,
} from "@/utils/dashboard-navigation";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";

export const usePathLinks = (): DashboardLink[] => {
  const pathname = usePathname();
  const t = useTranslations();

  const allLinks = useMemo(
    () => [
      ...Object.values(DASHBOARD_LINKS),
      ...Object.values(DASHBOARD_UTILS_LINKS),
      ...Object.values(DASHBOARD_ADMIN_TABS),
      ...Object.values(DASHBOARD_PRODUCT_ID),
    ],
    []
  );

  const matchesPath = (link: DashboardLink, currentPath: string): boolean => {
    const translatedPath = t(link.pathKey);

    // Handle dynamic routes with square brackets
    if (translatedPath.includes("[") && translatedPath.includes("]")) {
      const pathPattern = translatedPath.replace(/\[.*?\]/g, "[^/]+");
      const regex = new RegExp(`^${pathPattern}$`);
      return regex.test(currentPath);
    }

    return translatedPath === currentPath;
  };

  const createLinkForDynamicPath = useCallback(
    (link: DashboardLink, currentPath: string): DashboardLink => {
      const translatedPath = t(link.pathKey);

      if (translatedPath.includes("[") && translatedPath.includes("]")) {
        return {
          ...link,
          pathKey: currentPath,
        };
      }

      return link;
    },
    [t]
  );

  const parsedPathLinks = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const matchedLinks: DashboardLink[] = [];

    for (let i = 0; i < segments.length; i++) {
      const currentPath = `/${segments.slice(0, i + 1).join("/")}`;

      const matchingLink = allLinks.find((link) => matchesPath(link, currentPath));

      if (matchingLink) {
        const finalLink = createLinkForDynamicPath(matchingLink, currentPath);
        matchedLinks.push(finalLink);
      }
    }

    return matchedLinks;
  }, [pathname, t, allLinks]);

  return parsedPathLinks;
};
