const API_URL = process.env.EXPO_PUBLIC_API_URL;

function getStripeAmountFromKes(amountKes) {
  const numericAmount = Number(amountKes);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error("Invalid card payment amount.");
  }

  return Math.round(numericAmount * 100);
}

export async function createStripePaymentIntent({
  amountKes,
  orderReference,
  customer,
}) {
  if (!API_URL) {
    throw new Error("Missing EXPO_PUBLIC_API_URL in the mobile app .env file.");
  }

  const amount = getStripeAmountFromKes(amountKes);

  const response = await fetch(`${API_URL}/stripe/create-payment-intent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      currency: "kes",
      orderReference,
      customer,
    }),
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("Stripe backend returned an invalid response.");
  }

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Unable to start card payment.");
  }

  return data;
}