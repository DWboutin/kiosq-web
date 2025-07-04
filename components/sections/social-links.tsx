import { SocialButton } from "@/components/ui/social-button";
import { FacebookIcon } from "@/components/ui/icons/facebook-icon";
import { InstagramIcon } from "@/components/ui/icons/instagram-icon";
import { TikTokIcon } from "@/components/ui/icons/tiktok-icon";
import { XIcon } from "@/components/ui/icons/x-icon";
import { FC } from "react";
import { cn } from "@/lib/utils";

type SocialLinksProps = {
  facebookPageUrl: string | null;
  instagramPageUrl: string | null;
  tiktokPageUrl: string | null;
  xPageUrl: string | null;
  className?: string;
};

export const SocialLinks: FC<SocialLinksProps> = ({
  facebookPageUrl,
  instagramPageUrl,
  tiktokPageUrl,
  xPageUrl,
  className,
}) => {
  return (
    <div className={cn("flex flex-row gap-2 items-start", className)}>
      {facebookPageUrl && (
        <SocialButton platform="facebook" href={facebookPageUrl}>
          <FacebookIcon className="size-6" color="white" />
        </SocialButton>
      )}
      {instagramPageUrl && (
        <SocialButton platform="instagram" href={instagramPageUrl}>
          <InstagramIcon className="size-6" color="white" />
        </SocialButton>
      )}
      {tiktokPageUrl && (
        <SocialButton platform="tiktok" href={tiktokPageUrl}>
          <TikTokIcon className="size-6" color="white" />
        </SocialButton>
      )}
      {xPageUrl && (
        <SocialButton platform="x" href={xPageUrl}>
          <XIcon className="size-6" color="white" />
        </SocialButton>
      )}
    </div>
  );
};
