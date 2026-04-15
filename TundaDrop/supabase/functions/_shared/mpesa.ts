const MPESA_ENV = Deno.env.get("MPESA_ENV") ?? "sandbox";
const MPESA_CONSUMER_KEY = Deno.env.get("MPESA_CONSUMER_KEY") ?? "";
const MPESA_CONSUMER_SECRET = Deno.env.get("MPESA_CONSUMER_SECRET") ?? "";
const MPESA_SHORTCODE = Deno.env.get("MPESA_SHORTCODE") ?? "";
const MPESA_PASSKEY = Deno.env.get("MPESA_PASSKEY") ?? "";
const MPESA_CALLBACK_BASE_URL =
  Deno.env.get("MPESA_CALLBACK_BASE_URL") ?? "";

function getBaseUrl() {
  return MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
}

export function assertMpesaConfig() {
  const missing = [
    ["MPESA_CONSUMER_KEY", MPESA_CONSUMER_KEY],
    ["MPESA_CONSUMER_SECRET", MPESA_CONSUMER_SECRET],
    ["MPESA_SHORTCODE", MPESA_SHORTCODE],
    ["MPESA_PASSKEY", MPESA_PASSKEY],
    ["MPESA_CALLBACK_BASE_URL", MPESA_CALLBACK_BASE_URL],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length) {
    throw new Error(`Missing M-Pesa secrets: ${missing.join(", ")}`);
  }
}

export function getTimestamp() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");

  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join("");
}

export function buildStkPassword(timestamp: string) {
  return btoa(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`);
}

export async function getAccessToken() {
  assertMpesaConfig();

  const credentials = btoa(
    `${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`,
  );

  const response = await fetch(
    `${getBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    throw new Error(
      data.errorMessage || data.error_description || "Failed to get M-Pesa access token.",
    );
  }

  return data.access_token as string;
}

type StkPayload = {
  amountKes: number;
  phone: string;
  accountReference: string;
  transactionDesc: string;
  callbackPath?: string;
};

export async function initiateStkPush(payload: StkPayload) {
  assertMpesaConfig();

  const token = await getAccessToken();
  const timestamp = getTimestamp();
  const password = buildStkPassword(timestamp);
  const callbackPath = payload.callbackPath ?? "/functions/v1/mpesa-callback";

  const body = {
    BusinessShortCode: MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Math.round(payload.amountKes),
    PartyA: payload.phone,
    PartyB: MPESA_SHORTCODE,
    PhoneNumber: payload.phone,
    CallBackURL: `${MPESA_CALLBACK_BASE_URL}${callbackPath}`,
    AccountReference: payload.accountReference,
    TransactionDesc: payload.transactionDesc,
  };

  const response = await fetch(
    `${getBaseUrl()}/mpesa/stkpush/v1/processrequest`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.errorMessage || data.ResponseDescription || "Failed to initiate STK push.",
    );
  }

  return data;
}