"use client";

import { Locales } from "@/types/app";
import { createContext, useContext, ReactNode, useState } from "react";

interface LocaleDropdownContextValues {
  localizedPathnames: Record<Locales, string> | null;
  handleSetLocalizedPathnames: (pathnames: Record<Locales, string> | null) => void;
}

const LocaleDropdownContext = createContext({} as LocaleDropdownContextValues);

export const useLocaleDropdownContext = () => {
  const context = useContext(LocaleDropdownContext);

  if (context === undefined) {
    throw new Error("usenameContext must be used within nameProvider");
  }

  return context;
};

interface LocaleDropdownProviderProps {
  children: ReactNode;
}

export const LocaleDropdownProvider = ({ children }: LocaleDropdownProviderProps) => {
  const [localizedPathnames, setLocalizedPathnames] = useState<Record<Locales, string> | null>(
    null
  );
  const handleSetLocalizedPathnames = (pathnames: Record<Locales, string> | null) => {
    setLocalizedPathnames(pathnames);
  };

  return (
    <LocaleDropdownContext.Provider
      value={{
        localizedPathnames,
        handleSetLocalizedPathnames,
      }}
    >
      {children}
    </LocaleDropdownContext.Provider>
  );
};
