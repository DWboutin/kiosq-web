import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/ui/icons/close-icon";
import { PlusSquareIcon } from "@/components/ui/icons/plus-square-icon";
import { Input } from "@/components/ui/input";
import { ProductFormValues } from "@/features/product-form-drawer/hooks/use-product-form";
import { useTranslations } from "next-intl";
import { FC } from "react";
import { FieldArrayWithId, Control, Controller, FieldErrors } from "react-hook-form";
import { AddTranslationField } from "@/features/add-translation-field/add-translation-field";

type ProductFormChecklistProps = {
  fields: FieldArrayWithId<ProductFormValues, "checklist", "id">[];
  addChecklistItem: () => void;
  remove: (index: number) => void;
  control: Control<ProductFormValues>;
  errors: FieldErrors<ProductFormValues>;
};

export const ProductFormChecklist: FC<ProductFormChecklistProps> = ({
  fields,
  addChecklistItem,
  remove,
  control,
  errors,
}) => {
  const t = useTranslations("ProductFormChecklist");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between mb-2">
        <div className="flex flex-col gap-2">
          <div className="text-base font-semibold">{t("title")}</div>
          <p className="text-sm text-neutral-darker">{t("description")}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addChecklistItem}
          disabled={fields.length >= 5}
        >
          <PlusSquareIcon className="size-4 mr-2" />
          {t("addButton")}
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        {fields.map((field, index) => (
          <div key={field.id}>
            <div className="flex items-center gap-2 mb-2">
              <Controller
                name={`checklist.${index}.value`}
                control={control}
                render={({ field }) => (
                  <Input
                    id={`checklist-${index}`}
                    placeholder={t("inputPlaceholder")}
                    className="flex-1"
                    {...field}
                  />
                )}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                <CloseIcon className="size-4" />
              </Button>
            </div>
            {errors.checklist?.[index]?.value && (
              <div className="mb-2">
                <p
                  id={`checklist-${index}-error`}
                  className="text-brand-danger text-xs"
                  role="alert"
                >
                  {errors.checklist?.[index]?.value?.message}
                </p>
              </div>
            )}
            <AddTranslationField
              name={`checklist.${index}.value`}
              control={control}
              errors={errors}
            />
          </div>
        ))}
      </div>

      {fields.length === 0 && <p className="text-sm text-gray-500">{t("noChecklist")}</p>}
    </div>
  );
};
