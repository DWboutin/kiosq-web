import { getBaseUrl } from "@/utils/get-base-url";
import { AuthenticatedUserKiosq } from "@/utils/factories/authenticated-user-kiosqs-factory";

export const getAuthenticatedUserKiosqById = async (
  kiosqId: string
): Promise<AuthenticatedUserKiosq> => {
  const response = await fetch(`${getBaseUrl()}/api/users/current/kiosq/${kiosqId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch kiosq: ${response.statusText}`);
  }

  const data = await response.json();

  return data.kiosq;
};
