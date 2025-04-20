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

export type ProductCategory = Database["public"]["Tables"]["categories"]["Row"];
export type ProductCategoryWithTranslations = Omit<
  ProductCategory,
  "name_translations" | "description_translations" | "slug"
> & {
  name_translations: Record<Locales, string>;
  description_translations: Record<Locales, string>;
  slug: Record<Locales, string>;
};
export type ProductCategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
