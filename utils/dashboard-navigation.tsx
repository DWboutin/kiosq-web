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

type DashboardLink = {
  path: string;
  labelKey: string;
  icon?: React.ReactNode;
  role?: UserRole;
};

export const DASHBOARD_LINKS: Record<string, DashboardLink> = {
  dashboard: {
    path: "/dashboard",
    labelKey: "DashboardMenu.dashboard",
    icon: <DashboardIcon className="size-6" />,
  },
  products: {
    path: "/dashboard/products",
    labelKey: "DashboardMenu.products",
    icon: <StorefrontIcon className="size-6" />,
  },
  discounts: {
    path: "/dashboard/discounts",
    labelKey: "DashboardMenu.discounts",
    icon: <DiscountHandIcon className="size-6" />,
  },
  events: {
    path: "/dashboard/events",
    labelKey: "DashboardMenu.events",
    icon: <CalendarDotsIcon className="size-6" />,
  },
  yourStore: {
    path: "/dashboard/your-store",
    labelKey: "DashboardMenu.yourStore",
    icon: <IdentificationCardIcon className="size-6" />,
  },
  yourKiosqs: {
    path: "/dashboard/your-kiosqs",
    labelKey: "DashboardMenu.yourKiosqs",
    icon: <MapPinAreaIcon className="size-6" />,
  },
  reservations: {
    path: "/dashboard/reservations",
    labelKey: "DashboardMenu.reservations",
    icon: <ShoppingBagIcon className="size-6" />,
  },
  billing: {
    path: "/dashboard/billing",
    labelKey: "DashboardMenu.billing",
    icon: <InvoiceIcon className="size-6" />,
  },
  admin: {
    path: "/dashboard/admin",
    labelKey: "DashboardMenu.admin",
    icon: <KeyholeIcon className="size-6" />,
    role: "admin" as UserRole,
  },
};

export const DASHBOARD_UTILS_LINKS: Record<string, DashboardLink> = {
  training: {
    path: "/dashboard/training",
    labelKey: "DashboardMenu.learningVideos",
    icon: <VideoIcon className="size-6" />,
  },
  account: {
    path: "/dashboard/account",
    labelKey: "DashboardMenu.yourAccount",
    icon: <UserCircleIcon className="size-6" />,
  },
};

export const DASHBOARD_ADMIN_TABS: Record<string, DashboardLink> = {
  importantInformation: {
    path: "/dashboard/admin",
    labelKey: "DashboardAdminTabs.importantInformation",
  },
  categories: {
    path: "/dashboard/admin/categories",
    labelKey: "DashboardAdminTabs.categories",
  },
};
