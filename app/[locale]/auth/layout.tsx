import { KiosqLogo } from "@/components/ui/kiosq-logo/kiosq-logo";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="w-2/3 min-h-screen bg-brand-gradient">
        <div className="flex flex-col gap-10 p-5">
          <div className="flex flex-row items-center gap-2">
            <KiosqLogo inverted />
            <span className="text-xl font-lato text-neutral-white">kiosq</span>
          </div>
          {children}
        </div>
      </div>
      <div className="fixed right-0 top-0 w-1/3 h-screen bg-neutral-lightest overflow-hidden p-5">
        <div className="flex flex-1 flex-col items-end justify-end z-10">
          <div className="flex flex-col text-right">
            <h2 className="text-2xl font-nunito text-neutral-white font-bold">
              Proche de vous, fier d&apos;ici
            </h2>
            <p className="text-base font-nunito text-neutral-white font-medium">
              Consommer local, c&apos;est prendre soin de chez soi
            </p>
          </div>
        </div>
        <Image
          src="/images/farmer-sign-in-image.png"
          alt="Farmer Sign In"
          fill
          className="object-cover absolute top-0 left-0 z-0"
        />
      </div>
    </div>
  );
}
