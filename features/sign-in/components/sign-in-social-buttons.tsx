"use client";

import { Button } from "@/components/ui/button";
import { AppleIcon } from "@/components/ui/icons/apple-icon";
import { GoogleIcon } from "@/components/ui/icons/google-icon";
import { MetaIcon } from "@/components/ui/icons/meta-icon";
import { TooltipContainer } from "@/components/ui/tooltip-container";
import { FC } from "react";
import { useTranslations } from "next-intl";

export const SignInSocialButtons: FC = () => {
  const t = useTranslations("SignIn");

  return (
    <div className="flex flex-row justify-center gap-4 mt-2">
      <TooltipContainer content={t("connectWithGoogle")}>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {}}
          className="flex items-center justify-center"
        >
          <GoogleIcon />
        </Button>
      </TooltipContainer>
      <TooltipContainer content={t("connectWithApple")}>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {}}
          className="flex items-center justify-center"
        >
          <AppleIcon />
        </Button>
      </TooltipContainer>
      <TooltipContainer content={t("connectWithMeta")}>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {}}
          className="flex items-center justify-center"
        >
          <MetaIcon />
        </Button>
      </TooltipContainer>
    </div>
  );
};
