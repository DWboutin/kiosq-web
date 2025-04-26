import { AppConfig } from "@/app-config";
import { Badge } from "@/components/ui/badge";
import { TooltipContainer } from "@/components/ui/tooltip-container";
import { FC, memo } from "react";

type TranslationDisplayProps = {
  translations: Record<string, string>;
  currentLocale: string;
  disabledTooltip?: boolean;
  disableHoverableContent?: boolean;
};

export const TranslationDisplay: FC<TranslationDisplayProps> = memo(
  ({ translations, currentLocale, disabledTooltip, disableHoverableContent = true }) => {
    const missingLocales = AppConfig.locales.filter((locale) => !translations[locale]?.trim());

    return (
      <div className="flex flex-col flex-1 gap-1 w-full">
        <TooltipContainer
          content={translations[currentLocale]}
          open={disabledTooltip ? false : undefined}
          disableHoverableContent={disableHoverableContent}
        >
          <div className="truncate w-full text-left">{translations[currentLocale]}</div>
        </TooltipContainer>
        <div className="flex flex-wrap gap-1">
          {missingLocales.map((locale) => (
            <Badge key={locale} className="w-fit bg-brand-warning">
              {locale} missing
            </Badge>
          ))}
        </div>
      </div>
    );
  }
);

TranslationDisplay.displayName = "TranslationDisplay";
