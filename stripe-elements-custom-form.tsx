import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import {  loadStripe } from "@stripe/stripe-js";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";

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

const stripePromise = loadStripe(
  "pk_test_...",
);

const CheckoutForm: FC<StripePaymentProps> = ({ payment, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useTranslation("checkout");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    const result = await stripe.confirmCardPayment(payment.client_secret, {
      payment_method: {
        card: elements.getElement(CardNumberElement),
        billing_details: {
          name: name,
        },
      },
    });

    if (result.error) {
      console.log(result.error.message);
      setError(result.error.message);
    } else {
      onSuccess();
      console.log("Оплачено!");
    }
  };

  return (
    <form
      className="p-[60px] rounded-[10px] border border-[#D7D3D3] w-full"
      onSubmit={handleSubmit}>
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-2xl">PAYMENT</h2>
      </div>
        <div className="card-fields">
          <label>
            NAME ON CARD *
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="JOHN ALEXANDER"
              required
            />
          </label>
          <label>
            CARD NUMBER *
            <CardNumberElement className="checkout-input" options={{ showIcon: true }} />
          </label>
          <div className="card-row">
            <label>
              EXPIRATION DATE *
              <CardExpiryElement className="checkout-input" />
            </label>
            <label>
              SECURITY CODE *
              <CardCvcElement className="checkout-input" />
            </label>
          </div>
        </div>
      )}
      <RoundButton
        type="submit"
        disabled={!stripe || !elements}
        text={t("pay_order_button")}
      />
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
      }}>
      <CheckoutForm payment={payment} onSuccess={onSuccess} />
    </Elements>
  );
};

export default StripePayment;
