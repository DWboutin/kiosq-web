"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { TabsStepNumbers } from "@/components/ui/tabs-step-numbers";
import { CreateProfileStepBanner } from "@/features/create-profile-wizard/components/create-profile-step-banner";
import { CreateProfileStepBasicInfo } from "@/features/create-profile-wizard/components/create-profile-step-basic-info";
import { CreateProfileStepDetails } from "@/features/create-profile-wizard/components/create-profile-step-details";
import { CreateProfileStepReview } from "@/features/create-profile-wizard/components/create-profile-step-review";
import { useCreateProfileWizard } from "./hooks/use-create-profile-wizard";
import { FC } from "react";
import { useTranslations } from "next-intl";
import { LoadingButton } from "@/components/ui/loading-button";
import { CreateProfileSuccessDialog } from "@/features/create-profile-wizard/components/create-profile-success-dialog";
import { ButtonBrand } from "@/components/ui/button-brand";

export const CreateProfileWizard: FC = () => {
  const t = useTranslations("CreateProfileWizard");
  const steps = [
    { id: "basic-info", label: t("basicInfo") },
    { id: "details", label: t("details") },
    { id: "banner", label: t("banner") },
    { id: "review", label: t("review") },
  ];
  const {
    selectors: {
      control,
      errors,
      isSubmitting,
      activeTab,
      formValues,
      isLastStep,
      isFirstStep,
      isSuccessDialogOpen,
    },
    actions: {
      handleFormSubmit,
      handleNext,
      handlePrevious,
      handleChangeTab,
      handleSuccessDialogClose,
      handleSuccessDialogCreateProduct,
    },
  } = useCreateProfileWizard(steps);

  return (
    <>
      <Card className="min-sm:w-[600px] w-[400px] shadow-none m-auto">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit}>
            <Tabs value={activeTab} onValueChange={handleChangeTab} className="w-full">
              <TabsStepNumbers
                activeTab={activeTab}
                steps={steps}
                className="mb-4 pb-2 border-b border-neutral-lightest"
              />

              <TabsContent value="basic-info">
                <CreateProfileStepBasicInfo control={control} errors={errors} />
              </TabsContent>
              <TabsContent value="details">
                <CreateProfileStepDetails control={control} errors={errors} />
              </TabsContent>
              <TabsContent value="banner">
                <CreateProfileStepBanner control={control} errors={errors} />
              </TabsContent>
              <TabsContent value="review">
                <CreateProfileStepReview formValues={formValues} />
              </TabsContent>
            </Tabs>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <ButtonBrand
            variant="outline"
            onClick={handlePrevious}
            type="button"
            disabled={isFirstStep || isSubmitting}
          >
            {t("previous")}
          </ButtonBrand>
          <LoadingButton onClick={handleNext} type="button" isLoading={isSubmitting}>
            {isLastStep ? t("createStore") : t("next")}
          </LoadingButton>
        </CardFooter>
      </Card>
      <CreateProfileSuccessDialog
        isOpen={isSuccessDialogOpen}
        onClose={handleSuccessDialogClose}
        onCreateProduct={handleSuccessDialogCreateProduct}
      />
    </>
  );
};
