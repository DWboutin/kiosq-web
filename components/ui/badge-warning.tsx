import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

type BadgeWarningProps = {
  className?: string;
} & PropsWithChildren;

export const BadgeWarning = ({ children, className }: BadgeWarningProps) => {
  return <Badge className={cn("w-fit bg-brand-warning", className)}>{children}</Badge>;
};
