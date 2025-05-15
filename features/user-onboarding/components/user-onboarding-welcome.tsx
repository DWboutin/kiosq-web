import { FC } from "react";
import Image from "next/image";
import onboardingImage from "@/public/images/user-onboarding.png";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTranslations } from "next-intl";

interface UserOnboardingWelcomeProps {
  titleId: string;
  descriptionId: string;
}

export const UserOnboardingWelcome: FC<UserOnboardingWelcomeProps> = ({
  titleId,
  descriptionId,
}) => {
  const t = useTranslations("UserOnboarding");

  return (
    <>
      <Image src={onboardingImage} alt={t("welcome")} />
      <DialogHeader className="border-b border-neutral-lightest flex flex-col justify-between gap-2 px-6 py-4">
        <DialogTitle id={titleId} className="text-base font-bold text-center">
          {t("welcome")}
        </DialogTitle>
        <DialogDescription id={descriptionId} className="text-center">
          {t("welcomeDescription")}
        </DialogDescription>
      </DialogHeader>
    </>
  );
};
