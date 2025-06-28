import { Locales } from "@/types/app";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import {
  createKiosqFormSchema,
  KiosqFormValues,
} from "@/features/kiosq-form-drawer/utils/kiosq-form-validation-schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createKiosq } from "@/actions/create-kiosq";
import { updateKiosq } from "@/actions/update-kiosq";
import { toast } from "sonner";
import { SideFormDrawerRef } from "@/components/ui/side-form-drawer";
import { useRef } from "react";
import { useCurrentUserKiosqById } from "@/hooks/use-current-user-kiosq-by-id";
import { AuthenticatedUserKiosq } from "@/utils/factories/authenticated-user-kiosqs-factory";
import { cacheKeys } from "@/utils/cache-keys";
import { Database } from "@/types/supabase";

type UseKiosqFormProps = {
  editMode?: boolean;
  kiosqId?: string;
  kiosqData?: AuthenticatedUserKiosq;
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

const fillKiosqFormValues = (kiosq: AuthenticatedUserKiosq, locale: Locales): KiosqFormValues => {
  return {
    ...kiosqDefaultValues,
    name: kiosq?.nameTranslations[locale] || "",
    name_translations: kiosq?.nameTranslations || {},
    description: kiosq?.descriptionTranslations[locale] || "",
    description_translations: kiosq?.descriptionTranslations || {},
    address: kiosq?.address || "",
    city: kiosq?.city || "",
    state: kiosq?.state || "",
    country: kiosq?.country || "",
    latitude: kiosq?.latitude?.toString() || "",
    longitude: kiosq?.longitude?.toString() || "",
    status: kiosq?.status || "open",
    is_default: kiosq?.isDefault || false,
    image_url: kiosq?.imageUrl || "",
  };
};

export const useKiosqForm = ({ editMode = false, kiosqId, kiosqData }: UseKiosqFormProps = {}) => {
  const t = useTranslations();
  const drawerRef = useRef<SideFormDrawerRef>(null);
  const locale = useLocale() as Locales;
  const queryClient = useQueryClient();
  const validationSchema = createKiosqFormSchema(locale, t);
  const {
    selectors: { kiosq },
    actions: { refetch },
  } = useCurrentUserKiosqById({ kiosqId, kiosqData });

  const defaultValues: KiosqFormValues = !kiosq
    ? kiosqDefaultValues
    : fillKiosqFormValues(kiosq, locale);

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
    onSuccess: async (savedKiosq: Database["public"]["Tables"]["kiosqs"]["Row"]) => {
      const message = editMode
        ? t("KiosqForm.updated", { name })
        : t("KiosqForm.created", { name });

      toast.success(message);

      if (editMode) {
        await queryClient.invalidateQueries({
          queryKey: cacheKeys.currentUserKiosqById(savedKiosq.id).queryKey,
        });
        refetch();
        drawerRef.current?.close();
      } else {
        reset();
        queryClient.invalidateQueries({
          queryKey: cacheKeys.currentUserProfileIdKiosqs.list(savedKiosq.profile_id).queryKey,
        });
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
