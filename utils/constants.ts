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

export type ProductCategory = {
  name: string;
  backgroundColor: string;
  contentColor: string;
  text: string;
  icon: FC<IconProps>;
};

export const PRODUCT_CATEGORIES: Record<string, ProductCategory> = {
  discountListing: {
    name: "discountListing",
    backgroundColor: "bg-brand-medium",
    contentColor: "text-white",
    text: "Rabais & Aubaines",
    icon: DiscountListingIcon,
  },
  preparedMeals: {
    name: "preparedMeals",
    backgroundColor: "bg-categories-preparedMeals-bg",
    contentColor: "text-categories-preparedMeals-text",
    text: "Plats préparés & Restaurants",
    icon: PreparedMealsIcon,
  },
  clothes: {
    name: "clothes",
    backgroundColor: "bg-categories-clothes-bg",
    contentColor: "text-categories-clothes-text",
    text: "Vêtements",
    icon: ClothesIcon,
  },
  fruits: {
    name: "fruits",
    backgroundColor: "bg-categories-fruits-bg",
    contentColor: "text-categories-fruits-text",
    text: "Fruits",
    icon: FruitsIcon,
  },
  vegetables: {
    name: "vegetables",
    backgroundColor: "bg-categories-vegetables-bg",
    contentColor: "text-categories-vegetables-text",
    text: "Légumes",
    icon: VegetablesIcon,
  },
  craftsmanship: {
    name: "craftsmanship",
    backgroundColor: "bg-categories-craftsmanship-bg",
    contentColor: "text-categories-craftsmanship-text",
    text: "Artisanat & Créateurs",
    icon: CraftsmanshipIcon,
  },
  bakery: {
    name: "bakery",
    backgroundColor: "bg-categories-bakery-bg",
    contentColor: "text-categories-bakery-text",
    text: "Boulangeries & Pâtisseries",
    icon: BakeryIcon,
  },
  coffeeShop: {
    name: "coffeeShop",
    backgroundColor: "bg-categories-coffeeShop-bg",
    contentColor: "text-categories-coffeeShop-text",
    text: "Cafés & Torréfacteurs",
    icon: CoffeeShopIcon,
  },
  selfcare: {
    name: "selfcare",
    backgroundColor: "bg-categories-selfcare-bg",
    contentColor: "text-categories-selfcare-text",
    text: "Soins & Beauté",
    icon: SelfcareIcon,
  },
  alcohol: {
    name: "alcohol",
    backgroundColor: "bg-categories-alcohol-bg",
    contentColor: "text-categories-alcohol-text",
    text: "Vins, Bières & Spiritueux",
    icon: AlcoholIcon,
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
    name: "coffeeShop",
    link: "/categories/coffeeShop",
  },
  {
    name: "alcohol",
    link: "/categories/alcohol",
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
] as const;

export const UNITS = ["kg", "g", "L", "cl", "ml", "pcs"] as const;

export const LOCALES = AppConfig.locales;

export const SLUG_REGEX = /^[a-z0-9-]+$/;
