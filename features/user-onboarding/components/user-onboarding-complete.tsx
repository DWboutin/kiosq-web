import { FC } from "react";
import { CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export const UserOnboardingComplete: FC = () => {
  const t = useTranslations("UserOnboarding");

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
      <div className="rounded-full bg-green-50 p-3">
        <CheckCircle className="h-12 w-12 text-brand-medium" />
      </div>
      <h3 className="text-xl font-bold">{t("completeTitle")}</h3>
      <p className="text-muted-foreground">{t("completeDescription")}</p>
    </div>
  );
};
