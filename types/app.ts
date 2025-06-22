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

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileType = Database["public"]["Enums"]["profile_type"];

export type RawProduct = Database["public"]["Tables"]["products"]["Row"];
export type RawProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];
export type RawProductPrice = Database["public"]["Tables"]["product_prices"]["Row"];
export type RawProductCategory = Database["public"]["Tables"]["categories"]["Row"];
export type RawProductCategoryWithParent = RawProductCategory & {
  parent_category: RawProductCategory | null;
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

export type NameTranslations = Record<Locales, string>;
export type DescriptionTranslations = Record<Locales, string>;
export type SlugTranslations = Record<Locales, string>;
export type PublishedStatus = "draft" | "published" | "deleted";
