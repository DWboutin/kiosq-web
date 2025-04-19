import { UserData } from "@/types/app";

export const getAuthenticatedUserData = async (): Promise<UserData | null> => {
  const response = await fetch(`/api/users/current`);

  if (!response.ok) {
    throw new Error("Failed to fetch location data");
  }

  const data = await response.json();

  return data.user;
};
