"use client";

import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { useReservationButtonContext } from "@/features/reservation-button/reservation-button";
import { createReservation } from "@/actions/create-reservation";

interface StripePaymentModalProps {
  onClose: () => void;
}

export const StripePaymentModal = ({ onClose }: StripePaymentModalProps) => {
  const t = useTranslations("StripePayment");
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const { purchaseData, selectedVariant } = useReservationButtonContext();
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "succeeded" | "failed"
  >("idle");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage("Stripe not yet loaded");
      return;
    }

    setLoading(true);
    setPaymentStatus("processing");
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/api/payment-success`,
        },
        redirect: "if_required",
      });

      console.log("paymentIntent", paymentIntent);
      console.log("purchaseData", purchaseData);

      if (error) {
        setPaymentStatus("failed");
        setErrorMessage(error.message || t("paymentError"));
      } else if (paymentIntent) {
        // Handle different payment statuses
        switch (paymentIntent.status) {
          case "succeeded":
            setPaymentStatus("succeeded");
            try {
              // Create reservation in database
              const reservationResult = await createReservation({
                variantId: selectedVariant.id,
                paymentIntentId: paymentIntent.id,
                quantity: purchaseData.quantity,
                kiosqId: purchaseData.kiosqId,
              });

              console.log("Reservation created successfully:", reservationResult);
              setErrorMessage(
                "Payment completed successfully! Your reservation has been confirmed."
              );
            } catch (reservationError) {
              console.error("Failed to create reservation:", reservationError);
              setErrorMessage(
                "Payment succeeded but failed to create reservation. Please contact support."
              );
            }
            break;
          case "processing":
            setPaymentStatus("processing");
            setErrorMessage("Payment is being processed...");
            break;
          case "requires_payment_method":
            setPaymentStatus("failed");
            setErrorMessage("Payment failed. Please try a different payment method.");
            break;
          default:
            setPaymentStatus("failed");
            setErrorMessage(`Payment status: ${paymentIntent.status}`);
        }
      } else {
        setPaymentStatus("failed");
        setErrorMessage("Unexpected payment response");
      }
    } catch (error) {
      console.error("Payment confirmation error:", error);
      setPaymentStatus("failed");
      setErrorMessage(t("paymentError"));
    }

    setLoading(false);
  };

  const getButtonText = () => {
    if (loading) return t("processing");
    if (paymentStatus === "succeeded") return "Close";
    return t("pay");
  };

  const getButtonVariant = () => {
    if (paymentStatus === "succeeded") return "default";
    if (paymentStatus === "failed") return "destructive";
    return "default";
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PaymentElement
            options={{
              layout: "tabs",
            }}
            onReady={() => setIsReady(true)}
            onLoadError={(error: unknown) => {
              console.error("PaymentElement loader error:", error);
              setErrorMessage("Failed to load payment form");
              setPaymentStatus("failed");
            }}
          />
          {errorMessage && (
            <div
              className={`text-sm ${
                paymentStatus === "succeeded" ? "text-green-600" : "text-destructive"
              }`}
            >
              {errorMessage}
            </div>
          )}
          {paymentStatus === "succeeded" && (
            <div className="text-green-600 text-sm font-medium">
              ✓ Your reservation has been confirmed! You can close this window.
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              variant={getButtonVariant()}
              disabled={loading || !stripe || !elements || !isReady}
              onClick={paymentStatus === "succeeded" ? onClose : undefined}
            >
              {getButtonText()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
