import { cacheKeys } from "@/utils/cache-keys";
import { getAuthenticatedUserKiosqById } from "@/utils/requests/get-authenticated-user-kiosq-by-id";
import {
  AuthenticatedUserKiosq,
  createAuthenticatedUserKiosqFactory,
} from "@/utils/factories/authenticated-user-kiosq-factory";
import { useQuery } from "@tanstack/react-query";

type UseCurrentUserKiosqByIdProps = {
  kiosqData?: AuthenticatedUserKiosq;
  kiosqId?: string;
};

export function useCurrentUserKiosqById({ kiosqData, kiosqId }: UseCurrentUserKiosqByIdProps) {
  console.log({ kiosqData, kiosqId });
  const queryKiosqId = (kiosqData?.id || kiosqId) as string;
  const {
    data: rawKiosq = null,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: cacheKeys.currentUserKiosqById(queryKiosqId).queryKey,
    queryFn: () => getAuthenticatedUserKiosqById(queryKiosqId),
    initialData: kiosqData,
    enabled: !!queryKiosqId,
  });

  const kiosq = rawKiosq ? createAuthenticatedUserKiosqFactory(rawKiosq) : null;

  return {
    selectors: {
      kiosq,
      isLoading,
      error,
    },
    actions: {
      refetch,
    },
  };
}
