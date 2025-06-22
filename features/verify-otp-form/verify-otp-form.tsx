"use client";

import { FC } from "react";
import { InputOTPGroup } from "@/components/ui/input-otp";
import { InputOTP } from "@/components/ui/input-otp";
import { InputOTPSlot } from "@/components/ui/input-otp";
import { useVerifyOtpForm } from "@/features/verify-otp-form/hooks/use-verify-otp-form";
import { useTranslations } from "next-intl";
import { ButtonBrand } from "@/components/ui/button-brand";

export const VerifyOtpForm: FC = () => {
  const t = useTranslations("VerifyOtpForm");
  const {
    selectors: { isLoading, errors, countdown },
    actions: { handleFormSubmit, handleOtpChange, handleAskForNewCode },
  } = useVerifyOtpForm();

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="space-y-2 flex flex-col items-center">
        <div className="flex justify-center w-full">
          <InputOTP maxLength={6} onChange={handleOtpChange}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        {errors.otp && (
          <p className="text-sm text-brand-danger text-center">{errors.otp.message}</p>
        )}
      </div>
      <div className="flex flex-col items-center gap-2">
        <ButtonBrand type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t("verifyLoading") : t("verifyButton")}
        </ButtonBrand>
        <ButtonBrand
          type="button"
          variant="secondary"
          onClick={handleAskForNewCode}
          className="w-full"
          disabled={countdown !== 0}
        >
          {countdown !== 0
            ? t("askForNewCodeButtonDisabled", { countdown })
            : t("askForNewCodeButton")}
        </ButtonBrand>
      </div>
    </form>
  );
};
