import { FC, useMemo } from "react";
import classNames from "classnames";
import { Locales } from "@/types/app";
import { useLocale } from "next-intl";
import { BadgeTranslation } from "@/components/ui/badge-translation";
import { BadgeWarning } from "@/components/ui/badge-warning";
import { AppConfig } from "@/app-config";
import { ProductCategory } from "@/utils/factories/product-category-with-parent-factory";
import { TooltipContainer } from "@/components/ui/tooltip-container";

type DashboardPageManagementHeadingProps = {
  title: Record<Locales, string>;
  description: Record<Locales, string>;
  productCategory: ProductCategory;
  cta?: React.ReactNode;
  headingLevel?: "h1" | "h2";
};

export const DashboardPageManagementHeading: FC<DashboardPageManagementHeadingProps> = ({
  title,
  description,
  cta,
  headingLevel = "h1",
}) => {
  const locale = useLocale() as Locales;
  const supportedLocales = AppConfig.locales.filter((l) => l !== locale);
  const Heading = headingLevel === "h1" ? "h1" : "h2";
  const titleFilledTranslation = useMemo(() => {
    return Object.keys(title).filter((key) => key !== locale);
  }, [title, locale]);
  const descriptionFilledTranslation = useMemo(() => {
    return Object.keys(description).filter((key) => key !== locale);
  }, [description, locale]);
  const missingTitleLocales = useMemo(() => {
    return supportedLocales.filter((locale) => !title[locale as Locales]);
  }, [title]);
  const missingDescriptionLocales = useMemo(() => {
    return supportedLocales.filter((locale) => !description[locale as Locales]);
  }, [description]);

  return (
    <div className="pt-8">
      <div className="flex flex-row max-md:flex-col-reverse justify-between items-start gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-2 items-center">
            <Heading
              className={classNames(
                "font-inter font-semibold text-neutral-black",
                headingLevel === "h1" ? "text-2xl" : "text-xl"
              )}
            >
              {title[locale]}
            </Heading>
            {titleFilledTranslation.length > 0 &&
              titleFilledTranslation.map((key) => (
                <TooltipContainer key={key} content={title[key as Locales]}>
                  <span>
                    <BadgeTranslation>{key}</BadgeTranslation>
                  </span>
                </TooltipContainer>
              ))}
            {missingTitleLocales.length > 0 &&
              missingTitleLocales.map((key) => (
                <BadgeWarning key={key}>&quot;{key}&quot; missing</BadgeWarning>
              ))}
          </div>
          <div className="flex flex-row gap-2">
            <p className="text-sm font-inter text-neutral-darker">{description[locale]}</p>
            {descriptionFilledTranslation.length > 0 &&
              descriptionFilledTranslation.map((key) => (
                <TooltipContainer
                  key={key}
                  content={description[key as Locales]}
                  disableHoverableContent
                >
                  <span>
                    <BadgeTranslation>{key}</BadgeTranslation>
                  </span>
                </TooltipContainer>
              ))}
            {missingDescriptionLocales.length > 0 &&
              missingDescriptionLocales.map((key) => (
                <BadgeWarning key={key}>&quot;{key}&quot; missing</BadgeWarning>
              ))}
          </div>
        </div>
        {cta && <div className="flex-1 max-md:w-full flex justify-end">{cta}</div>}
      </div>
    </div>
  );
};
