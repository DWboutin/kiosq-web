"use client";

import { FC } from "react";
import { InputOTPGroup } from "@/components/ui/input-otp";
import { InputOTP } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { InputOTPSlot } from "@/components/ui/input-otp";
import { useVerifyOtpForm } from "@/features/verify-otp-form/hooks/use-verify-otp-form";

export const VerifyOtpForm: FC = () => {
  const {
    selectors: { isLoading, errors },
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
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Verifying..." : "Verify"}
        </Button>
        <Button type="button" variant="secondary" onClick={handleAskForNewCode} className="w-full">
          Ask for a new code
        </Button>
      </div>
    </form>
  );
};
