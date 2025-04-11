"use client";

import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useVerifyOtpForm } from "@/features/verify-otp/hooks/use-verify-otp-form";

export default function VerifyOtpPage() {
  const {
    selectors: { isLoading, errors },
    actions: { handleFormSubmit, handleOtpChange },
  } = useVerifyOtpForm();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Verify your email</h1>
          <p className="text-sm text-muted-foreground">
            Enter the verification code sent to your email
          </p>
        </div>

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

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground h-9 rounded-md px-3 py-2 text-sm font-medium shadow-xs disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Verify"}
          </button>
        </form>
      </div>
    </div>
  );
}
