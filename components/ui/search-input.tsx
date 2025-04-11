"use client";

import { Button } from "@/components/ui/button";
import { SearchIcon } from "@/components/ui/icons/search-icon";
import { Input } from "@/components/ui/input";
import { FC } from "react";

export const SearchInput: FC = () => {
  return (
    <div className="flex flex-1 items-center relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 max-md:hidden">
        <SearchIcon className="w-4 h-4 text-neutral-dark" />
      </div>
      <Input
        placeholder="Rechercher sur kiosq"
        className="w-full rounded-full pl-9 pr-3 border-neutral-light shadow-none max-md:hidden"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          console.log("search");
        }}
        aria-label="Search"
        className="min-md:hidden"
      >
        <SearchIcon className="text-neutral-dark size-6" />
      </Button>
    </div>
  );
};
