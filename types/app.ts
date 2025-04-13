import { Session } from "@supabase/supabase-js";
import { SVGProps } from "react";

export type User = Session["user"];

export interface IconProps extends SVGProps<SVGSVGElement> {
  color?: string;
  className?: string;
}
