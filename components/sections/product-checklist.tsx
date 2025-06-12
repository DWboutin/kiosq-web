import { AppConfig } from "@/app-config";
import { BadgeTranslation } from "@/components/ui/badge-translation";
import { BadgeWarning } from "@/components/ui/badge-warning";
import { CheckIcon } from "@/components/ui/icons/check-icon";
import { TooltipContainer } from "@/components/ui/tooltip-container";
import { Locales } from "@/types/app";
import { useLocale } from "next-intl";
import { FC, useMemo } from "react";

type ProductChecklistProps = {
  checklistTranslations: Record<Locales, string>[];
  isAdmin?: boolean;
};

const ChecklistItem: FC<{ checklist: Record<Locales, string>; isAdmin?: boolean }> = ({
  checklist,
  isAdmin = false,
}) => {
  const locale = useLocale() as Locales;
  const filledTranslations = useMemo(() => {
    return Object.keys(checklist).filter((key) => key !== locale);
  }, [checklist, locale]);
  const missingTranslations = useMemo(() => {
    return AppConfig.locales.filter((key) => !checklist[key as Locales]);
  }, [checklist, locale]);

  return (
    <div className="flex flex-row items-center gap-2 text-sm font-inter text-neutral-darker">
      <CheckIcon className="size-4 text-brand-medium" />
      <span>{checklist[locale]}</span>
      {isAdmin &&
        filledTranslations.length > 0 &&
        filledTranslations.map((key) => (
          <TooltipContainer key={key} content={checklist[key as Locales]}>
            <span>
              <BadgeTranslation>{key}</BadgeTranslation>
            </span>
          </TooltipContainer>
        ))}
      {isAdmin && missingTranslations.length > 0 && (
        <BadgeWarning>
          {missingTranslations.map((key) => `"${key}"`).join(", ")} missing
        </BadgeWarning>
      )}
    </div>
  );
};

export const ProductChecklist: FC<ProductChecklistProps> = ({
  checklistTranslations,
  isAdmin = false,
}) => {
  const locale = useLocale() as Locales;

  return (
    <div className="flex flex-col gap-2">
      {checklistTranslations.map((checklist) => (
        <ChecklistItem key={checklist[locale]} checklist={checklist} isAdmin={isAdmin} />
      ))}
    </div>
  );
};
