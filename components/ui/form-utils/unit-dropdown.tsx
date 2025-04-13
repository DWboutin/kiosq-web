import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UNITS } from "@/utils/constants";
import { FC } from "react";

type UnitDropdownProps = {
  id: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

export const UnitDropdown: FC<UnitDropdownProps> = ({ id, placeholder, value, onChange }) => {
  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger className="w-full" id={id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {UNITS.map((unit) => (
          <SelectItem key={unit} value={unit}>
            {unit}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
