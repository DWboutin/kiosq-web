import { VerifyOtpForm } from "@/features/verify-otp-form/verify-otp-form";
import { Suspense } from "react";

export default function VerifyOtpPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Verify your email</h1>
          <p className="text-sm text-muted-foreground">
            Enter the verification code sent to your email
          </p>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <VerifyOtpForm />
        </Suspense>
      </div>
    </div>
  );
}
