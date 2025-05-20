"use client";

import { FC, memo, useMemo } from "react";
import { useLocale } from "next-intl";
import { useProductCategories } from "@/hooks/use-product-categories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Locales } from "@/types/app";
import { cn } from "@/lib/utils";

type CategoriesSelectProps = {
  id: string;
  placeholder: string;
  className?: string;
  parentId?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export const CategoriesSelect: FC<CategoriesSelectProps> = memo(
  ({ id, className, parentId = null, placeholder, value, onChange, disabled }) => {
    const locale = useLocale() as Locales;
    const {
      selectors: { categories },
    } = useProductCategories();
    const filteredCategories = useMemo(() => {
      if (!categories) {
        return [];
      }

      return categories
        .filter((category) => category.parentId === parentId)
        .map((category) => ({
          label: category.name[locale],
          value: category.id,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }, [categories, parentId, locale]);

    return (
      <Select onValueChange={onChange} value={value} disabled={disabled}>
        <SelectTrigger className={cn("w-full", className)} id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {filteredCategories?.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
);

CategoriesSelect.displayName = "CategoriesSelect";
