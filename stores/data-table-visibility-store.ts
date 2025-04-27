import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage } from "zustand/middleware";
import { VisibilityState } from "@tanstack/react-table";

type DataTableVisibilityState = {
  tables: Record<string, VisibilityState>;
};

type DataTableVisibilityActions = {
  getTableVisibility: (tableId: string) => VisibilityState | undefined;
  setTableVisibility: (tableId: string, visibility: VisibilityState) => void;
};

const initialState: DataTableVisibilityState = {
  tables: {},
};

type DataTableVisibilityStore = DataTableVisibilityState & DataTableVisibilityActions;

export const useDataTableVisibilityStore = create<DataTableVisibilityStore>()(
  persist(
    immer((set, get) => ({
      ...initialState,
      getTableVisibility: (tableId) => {
        return get().tables[tableId] || {};
      },
      setTableVisibility: (tableId, visibility) => {
        set((state) => {
          state.tables[tableId] = visibility;
        });
      },
    })),
    {
      name: "data-table-visibility-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
