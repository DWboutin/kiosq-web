import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { PropsWithChildren } from "react";

type DynamicLinkProps = {
  pathKey: string;
  id: string;
  className?: string;
  activeClassName?: string;
} & PropsWithChildren;

export const DynamicLink = ({
  pathKey,
  id,
  className,
  activeClassName,
  children,
}: DynamicLinkProps) => {
  const pathname = usePathname();
  const t = useTranslations();
  const path = t(pathKey);
  const href = path.replace(/\[[^\]]+\]/g, id);
  const isActive = pathname === path;

  return (
    <Link href={href} className={cn(className, isActive && activeClassName)}>
      {children}
    </Link>
  );
};
