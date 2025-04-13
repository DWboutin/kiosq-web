import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES_ORDER } from "@/utils/constants";
import { FC } from "react";

type CategoryDropdownProps = {
  id: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

const categories = CATEGORIES_ORDER.slice(1);

export const CategoryDropdown: FC<CategoryDropdownProps> = ({
  id,
  placeholder,
  value,
  onChange,
}) => {
  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger className="w-full" id={id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.name} value={category.name}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
