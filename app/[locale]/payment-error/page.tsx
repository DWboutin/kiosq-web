import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function PaymentErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>

        <p className="text-gray-600 mb-6">
          Unfortunately, your payment could not be processed. Please try again or contact support if
          the issue persists.
        </p>

        <div className="space-y-3">
          <Button onClick={() => window.history.back()} className="w-full">
            Try Again
          </Button>

          <Link href="/">
            <Button variant="outline" className="w-full">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
