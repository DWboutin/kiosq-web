"use client";

import { AppleIcon } from "@/components/ui/icons/apple-icon";
import { GoogleIcon } from "@/components/ui/icons/google-icon";
import { MetaIcon } from "@/components/ui/icons/meta-icon";
import { TooltipContainer } from "@/components/ui/tooltip-container";
import { FC } from "react";
import { useTranslations } from "next-intl";
import { ButtonBrand } from "@/components/ui/button-brand";

export const SignInSocialButtons: FC = () => {
  const t = useTranslations("SignIn");

  return (
    <div className="flex flex-row justify-center gap-4 mt-2">
      <TooltipContainer content={t("connectWithGoogle")}>
        <ButtonBrand
          variant="outline"
          size="icon"
          onClick={() => {}}
          className="flex items-center justify-center"
        >
          <GoogleIcon />
        </ButtonBrand>
      </TooltipContainer>
      <TooltipContainer content={t("connectWithApple")}>
        <ButtonBrand
          variant="outline"
          size="icon"
          onClick={() => {}}
          className="flex items-center justify-center"
        >
          <AppleIcon />
        </ButtonBrand>
      </TooltipContainer>
      <TooltipContainer content={t("connectWithMeta")}>
        <ButtonBrand
          variant="outline"
          size="icon"
          onClick={() => {}}
          className="flex items-center justify-center"
        >
          <MetaIcon />
        </ButtonBrand>
      </TooltipContainer>
    </div>
  );
};
