import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/ui/icons/close-icon";
import { PlusSquareIcon } from "@/components/ui/icons/plus-square-icon";
import { Input } from "@/components/ui/input";
import { ProductFormValues } from "@/features/product-form-drawer/hooks/use-product-form";
import { FC } from "react";
import { FieldArrayWithId, Control, Controller } from "react-hook-form";

type ProductFormChecklistProps = {
  fields: FieldArrayWithId<ProductFormValues, "checklist", "id">[];
  addChecklistItem: () => void;
  remove: (index: number) => void;
  control: Control<ProductFormValues>;
};

export const ProductFormChecklist: FC<ProductFormChecklistProps> = ({
  fields,
  addChecklistItem,
  remove,
  control,
}) => {
  return (
    <div className="mt-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex flex-col gap-2">
          <div className="text-base font-semibold">Liste de points forts</div>
          <p className="text-sm text-neutral-darker">
            Ajoutez jusqu&apos;à 5 points forts pour votre produit. Cette liste permet de mieux
            vendre votre produit.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addChecklistItem}
          disabled={fields.length >= 5}
        >
          <PlusSquareIcon className="size-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center gap-2 mb-2">
          <Controller
            name={`checklist.${index}.value`}
            control={control}
            render={({ field }) => (
              <Input
                id={`checklist-${index}`}
                placeholder="Point fort"
                className="flex-1"
                {...field}
              />
            )}
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
            <CloseIcon className="size-4" />
          </Button>
        </div>
      ))}

      {fields.length === 0 && (
        <p className="text-sm text-gray-500">
          Aucun point fort. Cliquez sur &quot;Ajouter&quot; pour commencer.
        </p>
      )}
    </div>
  );
};
