import { FormInputContainer } from "@/components/ui/form-utils/form-input-container";
import { Input } from "@/components/ui/input";
import { Controller } from "react-hook-form";
import { FieldErrors, Control } from "react-hook-form";
import { FC } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import { AddTranslationField } from "@/features/add-translation-field/add-translation-field";
import { KiosqFormValues } from "@/features/kiosq-form-drawer/utils/kiosq-form-validation-schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

type KiosqFormProps = {
  control: Control<KiosqFormValues>;
  errors: FieldErrors<KiosqFormValues>;
  editMode?: boolean;
  isDefault?: boolean;
};

export const KiosqForm: FC<KiosqFormProps> = ({ control, errors, isDefault }) => {
  const t = useTranslations("KiosqForm");

  return (
    <>
      <FormInputContainer inputId="name" label={t("name")} error={errors.name?.message} required>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              id="name"
              placeholder={t("namePlaceholder")}
              aria-invalid={!!errors.name}
              {...field}
            />
          )}
        />
      </FormInputContainer>
      <AddTranslationField name="name" control={control} errors={errors} />

      <FormInputContainer
        inputId="description"
        label={t("description")}
        error={errors.description?.message}
      >
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Textarea
              id="description"
              placeholder={t("descriptionPlaceholder")}
              aria-invalid={!!errors.description}
              {...field}
            />
          )}
        />
      </FormInputContainer>
      <AddTranslationField
        name="description"
        control={control}
        errors={errors}
        fieldType="textarea"
      />

      <FormInputContainer
        inputId="address"
        label={t("address")}
        error={errors.address?.message}
        required
      >
        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <Input
              id="address"
              placeholder={t("addressPlaceholder")}
              aria-invalid={!!errors.address}
              {...field}
            />
          )}
        />
      </FormInputContainer>

      <div className="flex gap-2">
        <FormInputContainer
          inputId="city"
          label={t("city")}
          error={errors.city?.message}
          required
          className="flex-1"
        >
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <Input
                id="city"
                placeholder={t("cityPlaceholder")}
                aria-invalid={!!errors.city}
                {...field}
              />
            )}
          />
        </FormInputContainer>
        <FormInputContainer
          inputId="state"
          label={t("state")}
          error={errors.state?.message}
          required
          className="flex-1"
        >
          <Controller
            name="state"
            control={control}
            render={({ field }) => (
              <Input
                id="state"
                placeholder={t("statePlaceholder")}
                aria-invalid={!!errors.state}
                {...field}
              />
            )}
          />
        </FormInputContainer>
        <FormInputContainer
          inputId="country"
          label={t("country")}
          error={errors.country?.message}
          required
          className="flex-1"
        >
          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <Input
                id="country"
                placeholder={t("countryPlaceholder")}
                aria-invalid={!!errors.country}
                maxLength={2}
                {...field}
              />
            )}
          />
        </FormInputContainer>
      </div>

      <div className="flex gap-2">
        <FormInputContainer
          inputId="latitude"
          label={t("latitude")}
          error={errors.latitude?.message}
          className="flex-1"
        >
          <Controller
            name="latitude"
            control={control}
            render={({ field }) => (
              <Input
                id="latitude"
                type="number"
                step="any"
                placeholder={t("latitudePlaceholder")}
                aria-invalid={!!errors.latitude}
                {...field}
              />
            )}
          />
        </FormInputContainer>
        <FormInputContainer
          inputId="longitude"
          label={t("longitude")}
          error={errors.longitude?.message}
          className="flex-1"
        >
          <Controller
            name="longitude"
            control={control}
            render={({ field }) => (
              <Input
                id="longitude"
                type="number"
                step="any"
                placeholder={t("longitudePlaceholder")}
                aria-invalid={!!errors.longitude}
                {...field}
              />
            )}
          />
        </FormInputContainer>
      </div>

      <FormInputContainer
        inputId="status"
        label={t("status")}
        error={errors.status?.message}
        required
      >
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="status" aria-invalid={!!errors.status}>
                <SelectValue placeholder={t("statusPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">{t("statusOpen")}</SelectItem>
                <SelectItem value="temporary closed">{t("statusTemporaryClosed")}</SelectItem>
                <SelectItem value="closed">{t("statusClosed")}</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </FormInputContainer>

      <div className="flex items-center space-x-2">
        <Controller
          name="is_default"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="is_default"
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={isDefault}
            />
          )}
        />
        <label
          htmlFor="is_default"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {t("isDefault")}
        </label>
      </div>
    </>
  );
};
