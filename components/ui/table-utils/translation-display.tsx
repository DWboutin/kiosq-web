import { AppConfig } from "@/app-config";
import { Badge } from "@/components/ui/badge";
import { TooltipContainer } from "@/components/ui/tooltip-container";
import { FC } from "react";

type TranslationDisplayProps = {
  translations: Record<string, string>;
  currentLocale: string;
  disabledTooltip?: boolean;
};

export const TranslationDisplay: FC<TranslationDisplayProps> = ({
  translations,
  currentLocale,
  disabledTooltip,
}) => {
  const missingLocales = AppConfig.locales.filter((locale) => !translations[locale]?.trim());

  return (
    <div className="flex flex-col items-start gap-1">
      <TooltipContainer
        content={translations[currentLocale]}
        open={disabledTooltip ? false : undefined}
      >
        <div className="truncate max-w-full">{translations[currentLocale]}</div>
      </TooltipContainer>
      {missingLocales.map((locale) => (
        <Badge key={locale} className="w-fit bg-brand-warning">
          {locale} missing
        </Badge>
      ))}
    </div>
  );
};
