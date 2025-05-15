import { FC } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import onboardingCompleted from "@/public/images/user-onboarding-completed.png";

export const UserOnboardingComplete: FC = () => {
  const t = useTranslations("UserOnboarding");

  return (
    <>
      <Image src={onboardingCompleted} alt={t("completeDescription")} />
      <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
        <h3 className="text-xl font-bold">{t("completeTitle")}</h3>
        <p className="text-muted-foreground">{t("completeDescription")}</p>
      </div>
    </>
  );
};
