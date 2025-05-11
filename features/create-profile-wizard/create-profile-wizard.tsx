"use client";

import { Button } from "@/components/ui/button";
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

export const CreateProfileWizard: FC = () => {
  const t = useTranslations("CreateProfileWizard");
  const steps = [
    { id: "basic-info", label: t("basicInfo") },
    { id: "details", label: t("details") },
    { id: "banner", label: t("banner") },
    { id: "review", label: t("review") },
  ];
  const {
    selectors: { control, errors, isSubmitting, activeTab, formValues, isLastStep, isFirstStep },
    actions: { handleFormSubmit, handleNext, handlePrevious, handleChangeTab },
  } = useCreateProfileWizard(steps);

  return (
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
        <Button variant="outline" onClick={handlePrevious} type="button" disabled={isFirstStep}>
          {t("previous")}
        </Button>
        <Button onClick={handleNext} type="button" disabled={isSubmitting}>
          {isLastStep ? t("createStore") : t("next")}
        </Button>
      </CardFooter>
    </Card>
  );
};
