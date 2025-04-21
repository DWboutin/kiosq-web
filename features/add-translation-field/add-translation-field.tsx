import { Button } from "@/components/ui/button";
import { PlusSquareIcon } from "@/components/ui/icons/plus-square-icon";
import { Control, FieldErrors, FieldValues, get } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CloseIcon } from "@/components/ui/icons/close-icon";
import { cn } from "@/lib/utils";
import { useAddTranslationField } from "@/features/add-translation-field/hooks/use-add-translation-field";
import { FormInputContainer } from "@/components/ui/form-utils/form-input-container";

type Props<TFieldValues extends FieldValues> = {
  name: string;
  control: Control<TFieldValues>;
  fieldType?: "input" | "textarea";
  className?: string;
  errors: FieldErrors<TFieldValues>;
};

export const AddTranslationField = <TFieldValues extends FieldValues>({
  name,
  control,
  fieldType = "input",
  className,
  errors,
}: Props<TFieldValues>) => {
  const {
    selectors: { translationsField, remainingLocales, hasAvailableTranslations },
    actions: {
      handleTranslationChange,
      handleLocaleChange,
      removeTranslation,
      getRemainingLocales,
    },
  } = useAddTranslationField<TFieldValues>({ name, control });

  const renderField = (locale: string, value: string) =>
    fieldType === "input" ? (
      <Input
        value={value}
        onChange={(e) => handleTranslationChange(locale, e.target.value)}
        className="flex-1"
      />
    ) : (
      <Textarea
        value={value}
        onChange={(e) => handleTranslationChange(locale, e.target.value)}
        className="flex-1"
      />
    );

  return (
    <div className={cn(className)}>
      <div className="flex flex-col gap-2">
        {Object.entries(translationsField).map(([locale, value]) => (
          <div key={locale} className="flex gap-2 items-center items-start">
            <Select
              value={locale}
              onValueChange={(newLocale) => handleLocaleChange(locale, newLocale)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {getRemainingLocales(locale).map((fieldLocale) => (
                  <SelectItem key={fieldLocale} value={fieldLocale}>
                    {fieldLocale}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormInputContainer
              className="flex-1"
              inputId={`${name}-${locale}`}
              error={get(errors, `${name}_translations.${locale}.message`) as string | undefined}
            >
              {renderField(locale, value)}
            </FormInputContainer>

            <Button variant="ghost" size="icon" onClick={() => removeTranslation(locale)}>
              <CloseIcon className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {hasAvailableTranslations && (
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onMouseDown={() => {
            if (remainingLocales.length > 0) {
              handleLocaleChange("", remainingLocales[0]);
            }
          }}
        >
          <PlusSquareIcon className="mr-1" />
          <span>Add translation</span>
        </Button>
      )}
    </div>
  );
};
