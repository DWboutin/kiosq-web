import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Link, { LinkProps } from "next/link";
import { PropsWithChildren } from "react";

type DynamicLinkProps = {
  pathKey: string;
  id: string;
  className?: string;
  activeClassName?: string;
} & PropsWithChildren &
  Omit<LinkProps, "href">;

export const DynamicLink = ({
  pathKey,
  id,
  className,
  activeClassName,
  children,
  ...props
}: DynamicLinkProps) => {
  const pathname = usePathname();
  const t = useTranslations();
  const path = t(pathKey);
  const href = path.replace(/\[[^\]]+\]/g, id);
  const isActive = pathname === path;

  return (
    <Link href={href} className={cn(className, isActive && activeClassName)} {...props}>
      {children}
    </Link>
  );
};
