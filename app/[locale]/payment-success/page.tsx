import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

interface PaymentSuccessPageProps {
  searchParams: {
    order?: string;
    payment_intent?: string;
  };
}

export default function PaymentSuccessPage({ searchParams }: PaymentSuccessPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>

        <p className="text-gray-600 mb-6">
          Your reservation has been confirmed and payment has been processed successfully.
        </p>

        {searchParams.order && (
          <p className="text-sm text-gray-500 mb-4">Order ID: {searchParams.order}</p>
        )}

        <div className="space-y-3">
          <Link href="/dashboard">
            <Button className="w-full">Go to Dashboard</Button>
          </Link>

          <Link href="/">
            <Button variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
