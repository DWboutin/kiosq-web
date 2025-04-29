import { Separator } from "@/components/ui/separator";
import { SignInEmailForm } from "@/features/sign-in/components/sign-in-email-form";
import { SignInSocialButtons } from "@/features/sign-in/components/sign-in-social-buttons";
import { Link } from "@/i18n/navigation";

export const SignIn = () => {
  return (
    <div className="flex flex-col gap-4 bg-neutral-white rounded-lg p-5 shadow-lg">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-nunito text-neutral-darker font-bold text-center">
          Connectez-vous
        </h2>
        <p className="text-base font-nunito text-neutral-medium font-medium text-center">
          en utilisant les réseaux sociaux
        </p>
        <SignInSocialButtons />
        <div className="flex flex-row justify-center items-center gap-4 my-2">
          <Separator className="flex-1" />
          <span className="text-neutral-medium font-nunito font-medium">ou</span>
          <Separator className="flex-1" />
        </div>
        <SignInEmailForm />
        <p className="text-xs text-neutral-medium font-nunito font-medium text-center">
          En créant mon compte, j&apos;accepte les{" "}
          <Link href="/conditions-generales" className="text-brand-medium font-medium">
            conditions générales
          </Link>{" "}
          et{" "}
          <Link href="/politique-de-confidentialite" className="text-brand-medium font-medium">
            politique de confidentialité
          </Link>
        </p>
      </div>
    </div>
  );
};
