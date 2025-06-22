"use client";

import { FC } from "react";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormInputContainer } from "@/components/ui/form-utils/form-input-container";
import { useSignInEmailForm } from "../hooks/use-sign-in-email-form";
import { useTranslations } from "next-intl";
import { ButtonBrand } from "@/components/ui/button-brand";

export const SignInEmailForm: FC = () => {
  const t = useTranslations("SignIn");
  const {
    selectors: { errors, control, isLoading },
    actions: { handleFormSubmit },
  } = useSignInEmailForm();

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-sm">
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
          <FormInputContainer
            inputId="email"
            label={t("formEmail")}
            error={errors.email?.message}
            required
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  aria-invalid={!!errors.email}
                  {...field}
                />
              )}
            />
          </FormInputContainer>

          <div className="mt-2">
            <ButtonBrand type="submit" disabled={isLoading} className="w-full">
              {isLoading ? t("formLoading") : t("formContinue")}
            </ButtonBrand>
          </div>
        </form>
      </div>
    </div>
  );
};
