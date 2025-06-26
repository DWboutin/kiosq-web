import Link from "next/link";
import { FC, ReactNode } from "react";
import { Button } from "./button";

type SocialPlatform = "facebook" | "instagram" | "tiktok" | "x";

type SocialButtonProps = {
  platform: SocialPlatform;
  href: string;
  children: ReactNode;
  className?: string;
};

const socialPlatformStyles: Record<SocialPlatform, string> = {
  facebook: "bg-[#1877F2] hover:bg-[#1877F2]/90",
  instagram: "bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90",
  tiktok: "bg-[#000000] hover:bg-[#000000]/90",
  x: "bg-[#000000] hover:bg-[#000000]/90",
};

export const SocialButton: FC<SocialButtonProps> = ({
  platform,
  href,
  children,
  className = "",
}) => {
  return (
    <Link href={href} target="_blank" rel="noopener noreferrer">
      <Button
        asChild
        size="icon"
        className={`${socialPlatformStyles[platform]} text-white border-0 ${className}`}
      >
        <span className="[&_svg]:text-white [&_svg]:fill-white">{children}</span>
      </Button>
    </Link>
  );
};
