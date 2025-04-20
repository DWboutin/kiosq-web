import { AppConfig } from "@/app-config";
import { Badge } from "@/components/ui/badge";
import { FC } from "react";

type TranslationDisplayProps = {
  translations: Record<string, string>;
  currentLocale: string;
};

export const TranslationDisplay: FC<TranslationDisplayProps> = ({
  translations,
  currentLocale,
}) => {
  const missingLocales = AppConfig.locales.filter((locale) => !translations[locale]?.trim());

  return (
    <div className="flex flex-col gap-1">
      <div>{translations[currentLocale]}</div>
      {missingLocales.map((locale) => (
        <Badge key={locale} className="w-fit bg-brand-warning">
          {locale} missing
        </Badge>
      ))}
    </div>
  );
};
