import { DashboardIcon } from "@/components/ui/icons/dashboard-icon";
import { StorefrontIcon } from "@/components/ui/icons/storefront-icon";
import { DiscountHandIcon } from "@/components/ui/icons/discount-hand-icon";
import { CalendarDotsIcon } from "@/components/ui/icons/calendar-dots-icon";
import { IdentificationCardIcon } from "@/components/ui/icons/identification-card-icon";
import { MapPinAreaIcon } from "@/components/ui/icons/map-pin-area-icon";
import { ShoppingBagIcon } from "@/components/ui/icons/shopping-bag-icon";
import { InvoiceIcon } from "@/components/ui/icons/invoice-icon";
import { KeyholeIcon } from "@/components/ui/icons/keyhole-icon";
import { VideoIcon } from "@/components/ui/icons/video-icon";
import { UserCircleIcon } from "@/components/ui/icons/user-circle-icon";
import { UserRole } from "@/types/app";

export type DashboardLink = {
  pathKey: string;
  labelKey: string;
  icon?: React.ReactNode;
  role?: UserRole | UserRole[];
  children?: Record<string, DashboardLink>;
};

export const DASHBOARD_UTILS_LINKS: Record<string, DashboardLink> = {
  training: {
    pathKey: "Pathnames.dashboard_training",
    labelKey: "DashboardMenu.learningVideos",
    icon: <VideoIcon className="size-6" />,
  },
  account: {
    pathKey: "Pathnames.dashboard_account",
    labelKey: "DashboardMenu.yourAccount",
    icon: <UserCircleIcon className="size-6" />,
  },
};

export const DASHBOARD_ADMIN_TABS: Record<string, DashboardLink> = {
  importantInformation: {
    pathKey: "Pathnames.dashboard_admin",
    labelKey: "DashboardAdminTabs.importantInformation",
  },
  categories: {
    pathKey: "Pathnames.dashboard_admin_categories",
    labelKey: "DashboardAdminTabs.categories",
  },
};

export const DASHBOARD_LINKS: Record<string, DashboardLink> = {
  dashboard: {
    pathKey: "Pathnames.dashboard",
    labelKey: "DashboardMenu.dashboard",
    icon: <DashboardIcon className="size-6" />,
  },
  products: {
    pathKey: "Pathnames.dashboard_products",
    labelKey: "DashboardMenu.products",
    icon: <StorefrontIcon className="size-6" />,
    role: ["admin", "vendor-admin", "vendor-manager"],
  },
  discounts: {
    pathKey: "Pathnames.dashboard_discounts",
    labelKey: "DashboardMenu.discounts",
    icon: <DiscountHandIcon className="size-6" />,
    role: ["admin", "vendor-admin", "vendor-manager"],
  },
  events: {
    pathKey: "Pathnames.dashboard_events",
    labelKey: "DashboardMenu.events",
    icon: <CalendarDotsIcon className="size-6" />,
    role: ["admin", "vendor-admin", "vendor-manager"],
  },
  yourStore: {
    pathKey: "Pathnames.dashboard_yourStore",
    labelKey: "DashboardMenu.yourStore",
    icon: <IdentificationCardIcon className="size-6" />,
  },
  yourKiosqs: {
    pathKey: "Pathnames.dashboard_yourKiosqs",
    labelKey: "DashboardMenu.yourKiosqs",
    icon: <MapPinAreaIcon className="size-6" />,
    role: ["admin", "vendor-admin", "vendor-manager"],
  },
  reservations: {
    pathKey: "Pathnames.dashboard_reservations",
    labelKey: "DashboardMenu.reservations",
    icon: <ShoppingBagIcon className="size-6" />,
  },
  billing: {
    pathKey: "Pathnames.dashboard_billing",
    labelKey: "DashboardMenu.billing",
    icon: <InvoiceIcon className="size-6" />,
    role: ["admin", "vendor-admin", "vendor-manager"],
  },
  admin: {
    pathKey: "Pathnames.dashboard_admin",
    labelKey: "DashboardMenu.admin",
    icon: <KeyholeIcon className="size-6" />,
    role: "admin" as UserRole,
    children: DASHBOARD_ADMIN_TABS,
  },
};
