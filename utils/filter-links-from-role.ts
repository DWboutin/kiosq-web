import { UserData } from "@/types/app";
import { DashboardLink } from "@/utils/dashboard-navigation";

export const filterLinksFromRole = (links: DashboardLink[], userData: UserData | null) => {
  return links.filter((link) => {
    if (!userData) {
      return false;
    }

    const hasRequiredRole = Array.isArray(link.role)
      ? link.role.includes(userData.role)
      : userData.role === link.role;

    return (link.role && hasRequiredRole) || !link.role;
  });
};
