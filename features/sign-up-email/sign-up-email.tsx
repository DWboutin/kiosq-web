"use client";

import { FC } from "react";
import { SignUpEmailForm } from "./components/sign-up-email-form";

export const SignUpEmail: FC = () => {
  return (
    <div>
      <h1>Sign Up</h1>
      <SignUpEmailForm />
    </div>
  );
};
