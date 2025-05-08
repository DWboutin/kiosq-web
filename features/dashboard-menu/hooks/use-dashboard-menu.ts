import { usePathname } from "@/i18n/navigation";
import { useUserStore } from "@/stores/user-store";
import { DASHBOARD_LINKS, DashboardLink } from "@/utils/dashboard-navigation";
import { DASHBOARD_UTILS_LINKS } from "@/utils/dashboard-navigation";
import { filterLinksFromRole } from "@/utils/filter-links-from-role";
import { useEffect, useMemo, useRef, useState } from "react";

export interface UseDashboardMenuSelectors {
  isOpen: boolean;
  links: DashboardLink[];
  utilsLinks: DashboardLink[];
  navRef: React.RefObject<HTMLElement | null>;
  toggleButtonRef: React.RefObject<HTMLButtonElement | null>;
}

export interface UseDashboardMenuActions {
  handleToggleMenu: () => void;
}

export interface UseDashboardMenuHook {
  selectors: UseDashboardMenuSelectors;
  actions: UseDashboardMenuActions;
}

export function useDashboardMenu(): UseDashboardMenuHook {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const userData = useUserStore((state) => state.userData);
  const refreshUserData = useUserStore((state) => state.refreshUserData);
  const links = useMemo(() => {
    return filterLinksFromRole(Object.values(DASHBOARD_LINKS), userData);
  }, [userData]);
  const utilsLinks = useMemo(() => {
    return filterLinksFromRole(Object.values(DASHBOARD_UTILS_LINKS), userData);
  }, [userData]);

  const handleToggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        toggleButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleFocusOut = (e: FocusEvent) => {
      const target = e.target as Node;
      const menuContainer = navRef.current?.parentElement;

      if (menuContainer && !menuContainer.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("focusin", handleFocusOut);
    return () => {
      document.removeEventListener("focusin", handleFocusOut);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setIsOpen(false);
    }
  }, [pathname]);

  useEffect(() => {
    refreshUserData();
  }, []);

  return {
    selectors: {
      isOpen,
      links,
      utilsLinks,
      navRef,
      toggleButtonRef,
    },
    actions: {
      handleToggleMenu,
    },
  };
}
