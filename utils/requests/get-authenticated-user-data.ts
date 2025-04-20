import { UserData } from "@/types/app";

export const getAuthenticatedUserData = async (): Promise<UserData | null> => {
  try {
    const response = await fetch(`/api/users/current`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }

    const data = await response.json();

    return data.user;
  } catch (error) {
    console.error("Error fetching authenticated user data:", error);
    throw new Error("Failed request for authenticated user data");
  }
};
