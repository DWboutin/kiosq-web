import { Locales } from "@/types/app";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import {
  createKiosqFormSchema,
  KiosqFormValues,
} from "@/features/kiosq-form-drawer/utils/kiosq-form-validation-schema";
import { useMutation } from "@tanstack/react-query";
import { createKiosq } from "@/actions/create-kiosq";
import { updateKiosq } from "@/actions/update-kiosq";
import { toast } from "sonner";
import { SideFormDrawerRef } from "@/components/ui/side-form-drawer";
import { useRef } from "react";

type UseKiosqFormProps = {
  editMode?: boolean;
  kiosqId?: string;
};

const kiosqDefaultValues: KiosqFormValues = {
  name: "",
  name_translations: {},
  description: "",
  description_translations: {},
  address: "",
  city: "",
  state: "",
  country: "",
  latitude: "",
  longitude: "",
  status: "open",
  is_default: false,
  image_url: "",
};

export const useKiosqForm = ({ editMode = false, kiosqId }: UseKiosqFormProps = {}) => {
  const t = useTranslations();
  const drawerRef = useRef<SideFormDrawerRef>(null);
  const locale = useLocale() as Locales;

  const validationSchema = createKiosqFormSchema(locale, t);

  const defaultValues: KiosqFormValues = kiosqDefaultValues;

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<KiosqFormValues>({
    defaultValues,
    resolver: zodResolver(validationSchema) as Resolver<KiosqFormValues>,
  });

  const name = watch("name");

  const { mutate: submitKiosq, isPending } = useMutation({
    mutationFn: (data: KiosqFormValues) =>
      editMode ? updateKiosq({ ...data, locale, id: kiosqId! }) : createKiosq({ ...data, locale }),
    onSuccess: async () => {
      const message = editMode
        ? t("KiosqForm.updated", { name })
        : t("KiosqForm.created", { name });

      toast.success(message);

      if (editMode) {
        // TODO: Add invalidation for specific kiosq query when implemented
        drawerRef.current?.close();
      } else {
        reset();
        // TODO: Add invalidation for kiosqs list query when implemented
      }
    },
    onError: () => {
      const message = editMode ? t("KiosqForm.updatedError") : t("KiosqForm.createdError");

      toast.error(message);
    },
  });

  const onSubmit = handleSubmit((data) => {
    submitKiosq(data);
  });

  return {
    selectors: { control, errors, isSubmitting: isPending, drawerRef },
    actions: { handleFormSubmit: onSubmit },
  };
};
