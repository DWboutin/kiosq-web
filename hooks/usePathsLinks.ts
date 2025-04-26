import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  DASHBOARD_ADMIN_TABS,
  DASHBOARD_UTILS_LINKS,
  DashboardLink,
} from "@/utils/dashboard-navigation";
import { DASHBOARD_LINKS } from "@/utils/dashboard-navigation";

export const usePathLinks = (): DashboardLink[] => {
  const pathname = usePathname();

  return useMemo(() => {
    const paths = pathname.split("/").filter(Boolean);

    return paths.map(
      (path) => DASHBOARD_LINKS[path] || DASHBOARD_UTILS_LINKS[path] || DASHBOARD_ADMIN_TABS[path]
    );
  }, [pathname]);
};
