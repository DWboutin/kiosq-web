import { cookies } from "next/headers";

export async function fetchServerAuthenticated(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const cookieStore = await cookies();
  const cookieString = cookieStore
    .getAll()
    .map(({ name, value }: { name: string; value: string }) => `${name}=${value}`)
    .join("; ");

  const headers = {
    ...options.headers,
    Cookie: cookieString,
  };

  return fetch(url, {
    ...options,
    headers,
    cache: options.cache || "no-store",
  });
}
