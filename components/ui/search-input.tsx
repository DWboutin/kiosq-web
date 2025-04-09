import { SearchIcon } from "@/components/ui/icons/search-icon";
import { Input } from "@/components/ui/input";
import { FC } from "react";

export const SearchInput: FC = () => {
  return (
    <div className="flex flex-1 items-center relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2">
        <SearchIcon className="w-4 h-4 text-neutral-medium" />
      </div>
      <Input
        placeholder="Rechercher sur kiosq"
        className="w-full rounded-full pl-9 pr-3 border-neutral-lightest shadow-none"
      />
    </div>
  );
};
