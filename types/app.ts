import { Database } from "@/types/supabase";
import { Session } from "@supabase/supabase-js";
import { SVGProps } from "react";
import { AppConfig } from "@/app-config";

export type Locales = (typeof AppConfig)["locales"][number];

export type User = Session["user"];
export type UserData = Database["public"]["Tables"]["users"]["Row"];
export type UserRole = Database["public"]["Enums"]["user_role"];

export interface IconProps extends SVGProps<SVGSVGElement> {
  color?: string;
  className?: string;
}

export type InsertWithLocale<T> = T & {
  locale: string;
};

export type UpdateWithLocale<T> = T &
  InsertWithLocale<T> & {
    id: string;
  };

export type ProductCategoryWithTranslations = Omit<
  RawProductCategory,
  "name_translations" | "description_translations" | "slug"
> & {
  name_translations: Record<Locales, string>;
  description_translations: Record<Locales, string>;
  slug: Record<Locales, string>;
};
export type ProductCategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];

export type RawProfile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileType = Database["public"]["Enums"]["profile_type"];

export type RawProduct = Database["public"]["Tables"]["products"]["Row"];
export type RawProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];
export type RawProductPrice = Database["public"]["Tables"]["product_prices"]["Row"];
export type RawProductCategory = Database["public"]["Tables"]["categories"]["Row"];
export type RawProductCategoryWithParent = RawProductCategory & {
  parent_category: RawProductCategory | null;
};
export type RawKiosq = Database["public"]["Tables"]["kiosqs"]["Row"];
export type RawSchedule = Database["public"]["Tables"]["schedules"]["Row"];
export type RawKiosqWithSchedule = RawKiosq & {
  schedules: RawSchedule | null;
};
export type RawProfileWithKiosqs = RawProfile & {
  kiosqs: RawKiosq[];
};

export type RawProductWithVariantsAndPrices = RawProduct & {
  categories: RawProductCategory & {
    parent_category: RawProductCategory;
  };
  product_variants: RawProductVariant &
    {
      product_prices: RawProductPrice[];
    }[];
};

export type RawProductWithVariantsAndPricesAndProfile = RawProductWithVariantsAndPrices & {
  profiles: {
    profile_image: string | null;
    name_translations: Record<Locales, string>;
    slug_translations: Record<Locales, string>;
  };
};

export type NameTranslations = Record<Locales, string>;
export type DescriptionTranslations = Record<Locales, string>;
export type SlugTranslations = Record<Locales, string>;
export type PublishedStatus = "draft" | "published" | "deleted";
export type StoreStatus = "open" | "temporary closed" | "closed";
export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type Pagination = {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  skip: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type RawReservation = Database["public"]["Tables"]["reservations"]["Row"];
export type RawOrder = Database["public"]["Tables"]["orders"]["Row"];
export type RawOrderItem = Database["public"]["Tables"]["order_items"]["Row"];

export type RawReservationWithOrders = RawReservation & {
  orders: RawOrderWithOrderItems[];
};

export type RawOrderWithOrderItems = RawOrder & {
  order_items: RawOrderItem[];
};
