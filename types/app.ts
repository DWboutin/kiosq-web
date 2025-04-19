import { Database } from "@/types/supabase";
import { Session } from "@supabase/supabase-js";
import { SVGProps } from "react";

export type User = Session["user"];

export interface IconProps extends SVGProps<SVGSVGElement> {
  color?: string;
  className?: string;
}

export type ProductCategory = Database["public"]["Tables"]["categories"]["Row"];
export type ProductCategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
