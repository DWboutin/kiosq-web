import { Check } from "lucide-react";
import { FC } from "react";
import { PRODUCT_CATEGORIES } from "@/utils/constants";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface UserOnboardingCategoryButtonProps {
  autoFocus?: boolean;
  category: { name: string };
  selectedCategories: string[];
  handleCategoryClick: (category: string, onChange: (value: string[]) => void) => void;
  onChange: (value: string[]) => void;
}

export const UserOnboardingCategoryButton: FC<UserOnboardingCategoryButtonProps> = ({
  autoFocus,
  category,
  selectedCategories,
  handleCategoryClick,
  onChange,
}) => {
  const t = useTranslations("Categories");
  const categoryInfo = PRODUCT_CATEGORIES[category.name];
  const isSelected = selectedCategories.includes(category.name);

  const bgColorClass = categoryInfo.backgroundColor;
  const contentColorClass = categoryInfo.contentColor;
  const borderColor = contentColorClass.replace("text-", "");

  return (
    <button
      key={category.name}
      type="button"
      className={cn(
        "relative flex items-center rounded-full px-3 py-1.5 border-2 outline-0 transition-all",
        bgColorClass,
        isSelected ? `border-${borderColor}` : "border-transparent",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-medium focus-visible:ring-offset-2"
      )}
      onClick={() => handleCategoryClick(category.name, onChange)}
      disabled={selectedCategories.length >= 3 && !selectedCategories.includes(category.name)}
      autoFocus={autoFocus}
    >
      {categoryInfo?.icon && (
        <categoryInfo.icon className={cn("mr-1.5 h-3.5 w-3.5", contentColorClass)} />
      )}
      <span className={cn("text-sm", contentColorClass)}>{t(category.name)}</span>
      {isSelected && (
        <div className="ml-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white">
          <Check className="h-2.5 w-2.5 text-brand-medium" />
        </div>
      )}
    </button>
  );
};
