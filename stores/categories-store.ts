import { FormattedProductCategory } from "@/utils/factories/product-categories-factory";
import { create } from "zustand";

type CategoriesState = {
  initialData: FormattedProductCategory | null;
  selectedId: string | null;
  setInitialData: (data: FormattedProductCategory) => void;
  resetInitialData: () => void;
  selectCategory: (category: FormattedProductCategory) => void;
};

export const useCategoriesStore = create<CategoriesState>((set) => ({
  initialData: null,
  selectedId: null,
  setInitialData: (data) => set({ initialData: data }),
  resetInitialData: () => set({ initialData: null }),
  selectCategory: (category) =>
    set((state) => {
      const isReselect = state.selectedId === category.id;

      return {
        initialData: category,
        selectedId: isReselect ? null : category.id,
      };
    }),
}));
