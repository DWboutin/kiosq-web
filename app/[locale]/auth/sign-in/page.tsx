import { SignIn } from "@/features/sign-in/sign-in";
import { getTranslations } from "next-intl/server";

export default async function SignInPage() {
  const t = await getTranslations("SignIn");

  return (
    <div className="flex flex-1 flex-col gap-10 items-center justify-center">
      <h1 className="text-3xl font-nunito text-neutral-white font-bold text-center">
        {t.rich("pageTitle", {
          br: () => <br />,
        })}
      </h1>
      <SignIn />
    </div>
  );
}
