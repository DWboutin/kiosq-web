"use client";

import { FC } from "react";
import { GoogleIcon } from "@/components/ui/icons/google-icon";
import { MetaIcon } from "@/components/ui/icons/meta-icon";
import { EmailIcon } from "@/components/ui/icons/email-icon";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { AppleIcon } from "@/components/ui/icons/apple-icon";
import { useRouter } from "next/navigation";

export const SignIn: FC = () => {
  const router = useRouter();

  const handleGoogleAuth = () => {
    // Handle Google authentication
  };

  const handleAppleAuth = () => {
    // Handle Apple authentication
  };

  const handleMetaAuth = () => {
    // Handle Meta authentication
  };

  const handleEmailAuth = () => {
    // Navigate to email signup
    router.push("/auth/sign-up-email");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-20">
      <div className="flex flex-col items-center justify-center">
        <Image src="/images/auth-image.png" alt="Auth" className="h-56" width={225} height={225} />
      </div>
      <div className="flex flex-col items-center justify-center mb-10">
        <h1 className="text-2xl font-regular text-brand-dark text-center">Connectez-vous</h1>
      </div>
      <div className="flex flex-col gap-4 px-5 w-sm">
        <Button
          variant="outline"
          onClick={handleGoogleAuth}
          className="flex items-center justify-start w-full"
        >
          <GoogleIcon className="mr-2" />
          <span className="flex-1 text-center">Continuer avec Google</span>
        </Button>
        <Button
          variant="outline"
          onClick={handleAppleAuth}
          className="flex items-center justify-start w-full"
        >
          <AppleIcon className="mr-2" />
          <span className="flex-1 text-center">Continuer avec Apple</span>
        </Button>
        <Button
          variant="outline"
          onClick={handleMetaAuth}
          className="flex items-center justify-start w-full"
        >
          <MetaIcon className="mr-2" />
          <span className="flex-1 text-center">Continuer avec Meta</span>
        </Button>

        <Button
          variant="outline"
          onClick={handleEmailAuth}
          className="flex items-center justify-start w-full"
        >
          <EmailIcon className="mr-2" />
          <span className="flex-1 text-center">Avec mon courriel</span>
        </Button>
      </div>
    </div>
  );
};
