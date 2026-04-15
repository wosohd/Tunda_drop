import { supabase } from "../../lib/supabase";

export async function initiateMpesaStk({ orderId, phone }) {
  if (!orderId) {
    throw new Error("orderId is required.");
  }

  const cleanPhone = String(phone || "").trim();

  if (!cleanPhone) {
    throw new Error("Phone number is required.");
  }

  const { data, error } = await supabase.functions.invoke(
    "initiate-mpesa-stk",
    {
      body: {
        orderId,
        phone: cleanPhone,
      },
    }
  );

  if (error) {
    throw new Error(error.message || "Failed to initiate M-Pesa STK.");
  }

  if (!data?.success) {
    throw new Error(data?.error || "M-Pesa STK request was not accepted.");
  }

  return data;
}