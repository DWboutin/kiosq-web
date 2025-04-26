import { FormattedProductCategory } from "@/utils/factories/product-categories-factory";
import { create } from "zustand";

type CategoriesState = {
  initialData: FormattedProductCategory | null;
  selectedId: string | null;
  lastSelected: number;
  setInitialData: (data: FormattedProductCategory) => void;
  selectCategory: (category: FormattedProductCategory) => void;
  resetCategory: () => void;
};

export const useCategoriesStore = create<CategoriesState>((set) => ({
  initialData: null,
  selectedId: null,
  lastSelected: 0,
  setInitialData: (data) => set({ initialData: data }),
  selectCategory: (category) =>
    set({
      initialData: { ...category },
      selectedId: category.id,
      lastSelected: Date.now(),
    }),
  resetCategory: () =>
    set({
      initialData: null,
      selectedId: null,
      lastSelected: 0,
    }),
}));
