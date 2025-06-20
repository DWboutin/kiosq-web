import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { useTranslations } from "next-intl";
import { UNITS } from "@/utils/constants";
import { ProductVariantFormValues } from "@/features/product-variant-modal-provider/utils/product-variant-validation-schema";

type ProductVariantModalFormProps = {
  control: Control<ProductVariantFormValues>;
  errors: FieldErrors<ProductVariantFormValues>;
};

export const ProductVariantModalForm = ({ control, errors }: ProductVariantModalFormProps) => {
  const t = useTranslations("ProductVariantForm");

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label htmlFor="imageUrl">{t("image")}</Label>
        <Controller
          name="imageUrl"
          control={control}
          render={({ field: { value, onChange, onBlur } }) => (
            <ImageDropzone
              className="h-35"
              value={value || ""}
              onChange={onChange}
              onBlur={onBlur}
              error={!!errors.imageUrl}
              requiredDimensions={{ width: 240, height: 140 }}
              maxSize={5 * 1024 * 1024} // 5MB
            />
          )}
        />
        {errors.imageUrl && <p className="text-sm text-red-500">{errors.imageUrl.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">{t("quantity")}</Label>
          <Controller
            name="quantity"
            control={control}
            render={({ field }) => (
              <Input
                id="quantity"
                type="number"
                step="0.01"
                min="0"
                placeholder={t("quantityPlaceholder")}
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
              />
            )}
          />
          {errors.quantity && <p className="text-sm text-red-500">{errors.quantity.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">{t("unit")}</Label>
          <Controller
            name="unit"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("unitPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.unit && <p className="text-sm text-red-500">{errors.unit.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">{t("price")}</Label>
        <Controller
          name="price"
          control={control}
          render={({ field }) => (
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder={t("pricePlaceholder")}
              {...field}
              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
            />
          )}
        />
        {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
      </div>

      <div className="flex items-center space-x-2">
        <Controller
          name="isDefault"
          control={control}
          render={({ field }) => (
            <Switch
              id="isDefault"
              className="data-[state=checked]:bg-brand-medium"
              checked={field.value || false}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Label htmlFor="isDefault">{t("isDefault")}</Label>
      </div>
    </div>
  );
};
