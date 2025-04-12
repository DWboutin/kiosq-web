import { ReactQueryProvider } from "@/features/providers/react-query-provider";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return <ReactQueryProvider>{children}</ReactQueryProvider>;
};
