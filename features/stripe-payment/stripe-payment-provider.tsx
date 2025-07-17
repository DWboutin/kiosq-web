import { createContext, useContext, useState, ReactNode } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { StripePaymentModal } from "./stripe-payment-modal";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_API_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_API_KEY)
  : null;

interface StripePaymentContextType {
  clientSecret: string | null;
  setClientSecret: (secret: string | null) => void;
}

const StripePaymentContext = createContext<StripePaymentContextType | undefined>(undefined);

export const StripePaymentProvider = ({ children }: { children: ReactNode }) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  console.log("StripePaymentProvider - clientSecret:", clientSecret);
  console.log("StripePaymentProvider - stripePromise:", !!stripePromise);

  return (
    <StripePaymentContext.Provider value={{ clientSecret, setClientSecret }}>
      {children}
      {clientSecret &&
        (stripePromise ? (
          (() => {
            console.log("Rendering Stripe Elements with clientSecret:", clientSecret);
            return (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: "stripe",
                    variables: {
                      colorPrimary: "var(--color-brand)",
                      colorBackground: "var(--color-neutral)",
                      colorText: "var(--color-neutral-dark)",
                      colorDanger: "var(--color-destructive)",
                    },
                  },
                }}
              >
                <StripePaymentModal onClose={() => setClientSecret(null)} />
              </Elements>
            );
          })()
        ) : (
          <div>Stripe configuration missing</div>
        ))}
    </StripePaymentContext.Provider>
  );
};

export const useStripePayment = () => {
  const context = useContext(StripePaymentContext);
  if (!context) {
    throw new Error("useStripePayment must be used within StripePaymentProvider");
  }
  return context;
};
