import { getBaseUrl } from "@/utils/get-base-url";

export const getAuthenticatedUserKiosqById = async (kiosqId: string) => {
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
  console.log("data", data);
  return data.kiosq;
};
