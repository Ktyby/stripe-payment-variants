import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { FC, useState } from "react";

const stripePromise = loadStripe(
  "pk_test_...",
);

export interface Payment {
  amount: number;
  client_secret: string;
  currency: "eur";
  payment_intent_id: string;
}

export interface StripePaymentProps {
  payment: Payment;
  onSuccess: () => void;
}

const CheckoutForm: FC<StripePaymentProps> = ({ payment, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (elements == null || stripe == null) {
      return;
    }

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || "Payment error");
      return;
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret: payment.client_secret,
      redirect: "if_required",
      confirmParams: {
        return_url: `${window.location.href}?success=true`,
      },
    });

    if (error) setError(error.message || "Payment error");

    if (paymentIntent && paymentIntent.status === "succeeded") {
      onSuccess();
    }
  };

  return (
    <form
      className="lg:p-[60px] py-6 rounded-[10px] border border-[#D7D3D3] w-full"
      onSubmit={handleSubmit}>
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-2xl">PAYMENT</h2>
      </div>
      <PaymentElement
        options={{
          layout: {
            type: "tabs",
            defaultCollapsed: false,
          },
        }}
      />
      <div className="flex items-center justify-end mt-10">
        <button
          type="submit"
          disabled={!stripe || !elements}
        >
          PAY
        </button>
      </div>
      {error && <div className="checkout-error">{error}</div>}
    </form>
  );
};

const StripePayment: FC<StripePaymentProps> = ({ payment, onSuccess }) => {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        mode: "payment",
        amount: payment.amount,
        currency: payment.currency,
        locale: "en",
        appearance,
      }}>
      <CheckoutForm payment={payment} onSuccess={onSuccess} />
    </Elements>
  );
};

export default StripePayment;
