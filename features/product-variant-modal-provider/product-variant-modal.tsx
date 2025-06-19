import { Modal } from "@/components/ui/modal";
import { useProductVariantModalForm } from "@/features/product-variant-modal-provider/hooks/use-product-variant-modal-form";
import { ProductVariantModalForm } from "@/features/product-variant-modal-provider/product-variant-modal-form";
import { useProductVariantModalContext } from "@/features/product-variant-modal-provider/product-variant-modal-provider";

export const ProductVariantModal = () => {
  const { modalRef } = useProductVariantModalContext();
  const {
    selectors: { control, errors, isSubmitting },
    actions: { handleFormSubmit },
  } = useProductVariantModalForm();

  return (
    <Modal
      ref={modalRef}
      title="Edit Product Variant"
      description="Edit the product variant"
      confirmLabel="Save"
      cancelLabel="Cancel"
      action={handleFormSubmit}
      isDestructive={false}
      closeAction={() => {}}
      loading={isSubmitting}
      content={<ProductVariantModalForm control={control} errors={errors} />}
    />
  );
};
