import { ReactQueryProvider } from "@/features/providers/react-query-provider";
import { NextIntlClientProvider } from "next-intl";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <NextIntlClientProvider>
      <ReactQueryProvider>{children}</ReactQueryProvider>
    </NextIntlClientProvider>
  );
};
