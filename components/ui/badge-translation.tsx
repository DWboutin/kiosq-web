import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import { PropsWithChildren } from "react";

type BadgeTranslationProps = {
  className?: string;
} & PropsWithChildren;

export const BadgeTranslation = ({ children, className }: BadgeTranslationProps) => {
  return (
    <Badge className={cn("w-fit cursor-default bg-neutral-light text-neutral-darker", className)}>
      <CheckIcon className="w-4 h-4 text-brand-medium" />
      {children}
    </Badge>
  );
};
