import { SignIn } from "@/features/sign-in/sign-in";

export default function SignInPage() {
  return (
    <div className="flex flex-col gap-10 items-center justify-center">
      <h1 className="text-3xl font-nunito text-neutral-white font-bold text-center">
        Rejoignez un mouvement local, <br />
        simple et essentiel.
      </h1>
      <SignIn />
    </div>
  );
}
