import { FC } from "react";
import { PreparedMealsIcon } from "@/components/ui/icons/prepared-meals-icon";
import { ClothesIcon } from "@/components/ui/icons/clothes-icon";
import { FruitsIcon } from "@/components/ui/icons/fruits-icon";
import { VegetablesIcon } from "@/components/ui/icons/vegetables-icon";
import { CraftsmanshipIcon } from "@/components/ui/icons/craftsmanship-icon";
import { BakeryIcon } from "@/components/ui/icons/bakery-icon";
import { CoffeeShopIcon } from "@/components/ui/icons/coffee-shop-icon";
import { SelfcareIcon } from "@/components/ui/icons/selfcare-icon";
import { AlcoholIcon } from "@/components/ui/icons/alcohol-icon";
import { DiscountListingIcon } from "@/components/ui/icons/discount-listing-icon";
import { IconProps } from "@/types/app";
import { AppConfig } from "@/app-config";
import { AnimalIcon } from "@/components/ui/icons/animal-icon";
import { MapleIcon } from "@/components/ui/icons/maple-icon";

export type ProductCategory = {
  name: string;
  backgroundColor: string;
  contentColor: string;
  icon: FC<IconProps>;
};

export const PRODUCT_CATEGORIES: Record<string, ProductCategory> = {
  discountListing: {
    name: "discountListing",
    backgroundColor: "bg-brand-medium",
    contentColor: "text-white",
    icon: DiscountListingIcon,
  },
  preparedMeals: {
    name: "preparedMeals",
    backgroundColor: "bg-categories-preparedMeals-bg",
    contentColor: "text-categories-preparedMeals-text",
    icon: PreparedMealsIcon,
  },
  clothes: {
    name: "clothes",
    backgroundColor: "bg-categories-clothes-bg",
    contentColor: "text-categories-clothes-text",
    icon: ClothesIcon,
  },
  fruits: {
    name: "fruits",
    backgroundColor: "bg-categories-fruits-bg",
    contentColor: "text-categories-fruits-text",
    icon: FruitsIcon,
  },
  vegetables: {
    name: "vegetables",
    backgroundColor: "bg-categories-vegetables-bg",
    contentColor: "text-categories-vegetables-text",
    icon: VegetablesIcon,
  },
  craftsmanship: {
    name: "craftsmanship",
    backgroundColor: "bg-categories-craftsmanship-bg",
    contentColor: "text-categories-craftsmanship-text",
    icon: CraftsmanshipIcon,
  },
  bakery: {
    name: "bakery",
    backgroundColor: "bg-categories-bakery-bg",
    contentColor: "text-categories-bakery-text",
    icon: BakeryIcon,
  },
  maple: {
    name: "maple",
    backgroundColor: "bg-categories-maple-bg",
    contentColor: "text-categories-maple-text",
    icon: MapleIcon,
  },
  coffeeShop: {
    name: "coffeeShop",
    backgroundColor: "bg-categories-coffeeShop-bg",
    contentColor: "text-categories-coffeeShop-text",
    icon: CoffeeShopIcon,
  },
  selfcare: {
    name: "selfcare",
    backgroundColor: "bg-categories-selfcare-bg",
    contentColor: "text-categories-selfcare-text",
    icon: SelfcareIcon,
  },
  alcohol: {
    name: "alcohol",
    backgroundColor: "bg-categories-alcohol-bg",
    contentColor: "text-categories-alcohol-text",
    icon: AlcoholIcon,
  },
  animals: {
    name: "animals",
    backgroundColor: "bg-categories-animal-bg",
    contentColor: "text-categories-animal-text",
    icon: AnimalIcon,
  },
};

export const CATEGORIES_ORDER = [
  {
    name: "discountListing",
    link: "/categories/discountListing",
  },
  {
    name: "fruits",
    link: "/categories/fruits",
  },
  {
    name: "vegetables",
    link: "/categories/vegetables",
  },
  {
    name: "bakery",
    link: "/categories/bakery",
  },
  {
    name: "preparedMeals",
    link: "/categories/preparedMeals",
  },
  {
    name: "maple",
    link: "/categories/maple",
  },
  {
    name: "alcohol",
    link: "/categories/alcohol",
  },
  {
    name: "coffeeShop",
    link: "/categories/coffeeShop",
  },
  {
    name: "clothes",
    link: "/categories/clothes",
  },
  {
    name: "craftsmanship",
    link: "/categories/craftsmanship",
  },
  {
    name: "selfcare",
    link: "/categories/selfcare",
  },
  {
    name: "animals",
    link: "/categories/animals",
  },
] as const;

export const UNITS = ["kg", "g", "L", "cl", "ml", "pcs"] as const;

export const LOCALES = AppConfig.locales;

export const SLUG_REGEX = /^[a-z0-9-]+$/;

export const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;
