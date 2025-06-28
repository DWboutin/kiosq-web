import { cacheKeys } from "@/utils/cache-keys";
import { getAuthenticatedUserKiosqById } from "@/utils/requests/get-authenticated-user-kiosq-by-id";
import {
  AuthenticatedUserKiosq,
  authenticatedUserKiosqFactory,
} from "@/utils/factories/authenticated-user-kiosqs-factory";
import { useQuery } from "@tanstack/react-query";

type UseCurrentUserKiosqByIdProps = {
  kiosqData?: AuthenticatedUserKiosq;
  kiosqId?: string;
};

export function useCurrentUserKiosqById({ kiosqData, kiosqId }: UseCurrentUserKiosqByIdProps) {
  const queryKiosqId = (kiosqData?.id || kiosqId) as string;
  const {
    data: kiosq = null,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: cacheKeys.currentUserKiosqById(queryKiosqId).queryKey,
    queryFn: () => getAuthenticatedUserKiosqById(queryKiosqId),
    initialData: kiosqData,
    enabled: !!queryKiosqId,
  });

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
